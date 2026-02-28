// mockPlaidClient.js — simulates Plaid Link flow with a delay.
// To use real Plaid: replace the body of connectBank() with usePlaidLink + Edge Function.

import { MOCK_PLAID_ACCOUNTS, MOCK_PLAID_TRANSACTIONS, MOCK_INSTITUTIONS } from './mockData'
import { adaptPlaidAccount, adaptPlaidTransaction } from './plaidAdapter'
import { supabase } from '../supabase'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/**
 * Simulates the full Plaid Link + token exchange + data sync flow.
 * Returns { accounts, transactions } on success.
 */
export async function connectBank(userId, institutionId = 'ins_001') {
  // Simulate Plaid Link modal latency
  await delay(800)

  // Adapt Plaid accounts → app models
  const accountRows = MOCK_PLAID_ACCOUNTS.map(acc =>
    adaptPlaidAccount(acc, institutionId, userId)
  )

  // Insert accounts into Supabase
  const { data: insertedAccounts, error: accErr } = await supabase
    .from('accounts')
    .upsert(accountRows, { onConflict: 'plaid_account_id', ignoreDuplicates: false })
    .select()

  if (accErr) throw accErr

  // Build a map from Plaid account_id → Supabase UUID
  const accountIdMap = {}
  MOCK_PLAID_ACCOUNTS.forEach((plaidAcc, idx) => {
    if (insertedAccounts[idx]) {
      accountIdMap[plaidAcc.account_id] = insertedAccounts[idx].id
    }
  })

  // Adapt transactions, using the Supabase account UUIDs
  const txnRows = MOCK_PLAID_TRANSACTIONS.map(txn =>
    adaptPlaidTransaction(txn, accountIdMap[txn.account_id] || null, userId)
  )

  // Insert transactions (skip duplicates by plaid_transaction_id)
  const { error: txnErr } = await supabase
    .from('transactions')
    .upsert(txnRows, { onConflict: 'plaid_transaction_id', ignoreDuplicates: true })

  if (txnErr) throw txnErr

  return { accounts: insertedAccounts, transactionCount: txnRows.length }
}

export { MOCK_INSTITUTIONS }
