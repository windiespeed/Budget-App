// Supabase Edge Function: plaid-link-token
// Creates a Plaid Link token and returns it to the browser.
// The Plaid secret key never leaves the server.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID")
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET")
    const PLAID_ENV = Deno.env.get("PLAID_ENV") ?? "sandbox"

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("PLAID_CLIENT_ID and PLAID_SECRET secrets are not set. Run: supabase secrets set PLAID_CLIENT_ID=... PLAID_SECRET=...")
    }

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error("user_id is required")
    }

    const plaidBaseUrl = `https://${PLAID_ENV}.plaid.com`

    const response = await fetch(`${plaidBaseUrl}/link/token/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        client_name: "BudgetWise",
        country_codes: ["US"],
        language: "en",
        user: {
          client_user_id: user_id,
        },
        products: ["transactions"],
      }),
    })

    const data = await response.json()

    if (data.error_code) {
      throw new Error(`Plaid error: ${data.error_message} (${data.error_code})`)
    }

    return new Response(
      JSON.stringify({ link_token: data.link_token }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (err) {
    console.error("plaid-link-token error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})
