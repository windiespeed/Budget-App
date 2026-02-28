// plaidAdapter.js — the ONLY file that knows about Plaid's data shapes.
// All other files use the app's internal models.
// To swap to real Plaid: replace mockPlaidClient.js and point here.

import { MOCK_INSTITUTIONS } from './mockData'

/**
 * Convert a Plaid account object to the app's internal Account model.
 * @param {object} plaidAccount - Raw Plaid account object
 * @param {string} institutionId - Plaid institution_id
 * @param {string} userId - Supabase user ID
 * @returns {object} App-internal account row (matches Supabase `accounts` table)
 */
export function adaptPlaidAccount(plaidAccount, institutionId, userId) {
  const institution = MOCK_INSTITUTIONS.find(i => i.institution_id === institutionId)

  // Map Plaid subtype to our account_type enum
  const typeMap = {
    'checking':     'checking',
    'savings':      'savings',
    'credit card':  'credit',
    'investment':   'investment',
    'loan':         'loan',
    '401k':         'investment',
    'ira':          'investment',
  }

  const balance = plaidAccount.balances?.current ?? 0

  return {
    user_id: userId,
    name: plaidAccount.name,
    institution_name: institution?.name || 'Unknown Bank',
    account_type: typeMap[plaidAccount.subtype?.toLowerCase()] || 'checking',
    balance: balance,
    is_manual: false,
    plaid_account_id: plaidAccount.account_id,
    is_active: true,
  }
}

/**
 * Convert a Plaid transaction object to the app's internal Transaction model.
 * @param {object} plaidTxn - Raw Plaid transaction object
 * @param {string} supabaseAccountId - The Supabase account ID (UUID)
 * @param {string} userId - Supabase user ID
 * @returns {object} App-internal transaction row (matches Supabase `transactions` table)
 */
export function adaptPlaidTransaction(plaidTxn, supabaseAccountId, userId) {
  const category =
    plaidTxn.personal_finance_category?.primary ||
    plaidTxn.category_id ||
    'other'

  return {
    user_id: userId,
    account_id: supabaseAccountId,
    amount: plaidTxn.amount, // Positive = expense, negative = income (Plaid convention)
    description: plaidTxn.name,
    merchant_name: plaidTxn.merchant_name || null,
    category,
    transaction_date: plaidTxn.date,
    is_pending: plaidTxn.pending ?? false,
    is_manual: false,
    plaid_transaction_id: plaidTxn.transaction_id,
  }
}
