// Supabase Edge Function: plaid-exchange
// 1. Exchanges Plaid public_token for access_token (server-side only)
// 2. Fetches accounts + 30 days of transactions from Plaid
// 3. Saves access_token to plaid_items (service_role, not visible to browser)
// 4. Upserts accounts + transactions into Supabase
// 5. Returns { accounts, transactionCount } to the browser

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Maps Plaid account subtype → app's account_type enum
function mapAccountType(subtype: string): string {
  const map: Record<string, string> = {
    "checking":    "checking",
    "savings":     "savings",
    "credit card": "credit",
    "investment":  "investment",
    "401k":        "investment",
    "ira":         "investment",
    "brokerage":   "investment",
    "loan":        "loan",
    "mortgage":    "loan",
  }
  return map[subtype?.toLowerCase()] ?? "checking"
}

// Maps a Plaid account object → Supabase accounts row
function adaptAccount(plaidAccount: any, institutionName: string, userId: string) {
  return {
    user_id: userId,
    name: plaidAccount.name,
    institution_name: institutionName,
    account_type: mapAccountType(plaidAccount.subtype),
    balance: plaidAccount.balances?.current ?? 0,
    is_manual: false,
    plaid_account_id: plaidAccount.account_id,
    is_active: true,
  }
}

// Maps a Plaid transaction object → Supabase transactions row
function adaptTransaction(plaidTxn: any, supabaseAccountId: string | null, userId: string) {
  const category =
    plaidTxn.personal_finance_category?.primary ??
    plaidTxn.category?.[0] ??
    "other"

  return {
    user_id: userId,
    account_id: supabaseAccountId,
    amount: plaidTxn.amount,           // positive = expense, negative = income
    description: plaidTxn.name,
    merchant_name: plaidTxn.merchant_name ?? null,
    category: category.toLowerCase().replace(/\s+/g, "_"),
    transaction_date: plaidTxn.date,
    is_pending: plaidTxn.pending ?? false,
    is_manual: false,
    plaid_transaction_id: plaidTxn.transaction_id,
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // --- Environment ---
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID")
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET")
    const PLAID_ENV = Deno.env.get("PLAID_ENV") ?? "sandbox"
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("Plaid secrets not set. Run: supabase secrets set PLAID_CLIENT_ID=... PLAID_SECRET=...")
    }

    // --- Request body ---
    const { public_token, institution_id, institution_name, user_id } = await req.json()

    if (!public_token || !user_id) {
      throw new Error("public_token and user_id are required")
    }

    const plaidBaseUrl = `https://${PLAID_ENV}.plaid.com`
    const plaidHeaders = { "Content-Type": "application/json" }
    const plaidAuth = { client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET }

    // --- Step 1: Exchange public_token for access_token ---
    const exchangeRes = await fetch(`${plaidBaseUrl}/item/public_token/exchange`, {
      method: "POST",
      headers: plaidHeaders,
      body: JSON.stringify({ ...plaidAuth, public_token }),
    })
    const exchangeData = await exchangeRes.json()
    if (exchangeData.error_code) {
      throw new Error(`Plaid exchange error: ${exchangeData.error_message}`)
    }
    const { access_token, item_id } = exchangeData

    // --- Step 2: Fetch accounts ---
    const accountsRes = await fetch(`${plaidBaseUrl}/accounts/get`, {
      method: "POST",
      headers: plaidHeaders,
      body: JSON.stringify({ ...plaidAuth, access_token }),
    })
    const accountsData = await accountsRes.json()
    if (accountsData.error_code) {
      throw new Error(`Plaid accounts error: ${accountsData.error_message}`)
    }
    const plaidAccounts: any[] = accountsData.accounts ?? []

    // --- Step 3: Fetch transactions (last 30 days) ---
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 30 * 86_400_000).toISOString().split("T")[0]

    const txnRes = await fetch(`${plaidBaseUrl}/transactions/get`, {
      method: "POST",
      headers: plaidHeaders,
      body: JSON.stringify({
        ...plaidAuth,
        access_token,
        start_date: startDate,
        end_date: endDate,
        options: { count: 500, offset: 0 },
      }),
    })
    const txnData = await txnRes.json()
    if (txnData.error_code) {
      throw new Error(`Plaid transactions error: ${txnData.error_message}`)
    }
    const plaidTransactions: any[] = txnData.transactions ?? []

    // --- Step 4: Write to Supabase (service_role bypasses RLS) ---
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Store access_token securely — never returned to browser
    await supabase.from("plaid_items").upsert(
      { user_id, access_token, item_id, institution_id, institution_name },
      { onConflict: "item_id" }
    )

    // Upsert accounts
    const accountRows = plaidAccounts.map((acc) =>
      adaptAccount(acc, institution_name ?? "Bank", user_id)
    )
    const { data: insertedAccounts, error: accErr } = await supabase
      .from("accounts")
      .upsert(accountRows, { onConflict: "plaid_account_id" })
      .select()

    if (accErr) throw new Error(`Supabase accounts error: ${accErr.message}`)

    // Build Plaid account_id → Supabase UUID map
    const accountIdMap: Record<string, string> = {}
    plaidAccounts.forEach((pa, i) => {
      if (insertedAccounts?.[i]) {
        accountIdMap[pa.account_id] = insertedAccounts[i].id
      }
    })

    // Upsert transactions
    const txnRows = plaidTransactions.map((t) =>
      adaptTransaction(t, accountIdMap[t.account_id] ?? null, user_id)
    )

    if (txnRows.length > 0) {
      const { error: txnErr } = await supabase
        .from("transactions")
        .upsert(txnRows, { onConflict: "plaid_transaction_id", ignoreDuplicates: true })

      if (txnErr) throw new Error(`Supabase transactions error: ${txnErr.message}`)
    }

    // --- Step 5: Return result (access_token never included) ---
    return new Response(
      JSON.stringify({
        accounts: insertedAccounts,
        transactionCount: txnRows.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (err) {
    console.error("plaid-exchange error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
