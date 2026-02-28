// Mock data in exact Plaid API response shapes.
// When upgrading to real Plaid, only mockPlaidClient.js needs to change.

export const MOCK_INSTITUTIONS = [
  { institution_id: 'ins_001', name: 'Chase Bank',       logo: '🏦', primary_color: '#117ACA' },
  { institution_id: 'ins_002', name: 'Bank of America',  logo: '🏦', primary_color: '#E31837' },
  { institution_id: 'ins_003', name: 'Wells Fargo',      logo: '🏦', primary_color: '#CC0000' },
  { institution_id: 'ins_004', name: 'Capital One',      logo: '🏦', primary_color: '#004977' },
  { institution_id: 'ins_005', name: 'Citibank',         logo: '🏦', primary_color: '#056DAE' },
]

// Plaid-shaped account objects
export const MOCK_PLAID_ACCOUNTS = [
  {
    account_id: 'acc_plaid_001',
    name: 'Everyday Checking',
    official_name: 'Chase Total Checking',
    type: 'depository',
    subtype: 'checking',
    balances: { current: 4823.51, available: 4823.51, iso_currency_code: 'USD' },
    institution_id: 'ins_001',
    mask: '4321',
  },
  {
    account_id: 'acc_plaid_002',
    name: 'High-Yield Savings',
    official_name: 'Chase Savings Account',
    type: 'depository',
    subtype: 'savings',
    balances: { current: 12500.00, available: 12500.00, iso_currency_code: 'USD' },
    institution_id: 'ins_001',
    mask: '8765',
  },
  {
    account_id: 'acc_plaid_003',
    name: 'Freedom Unlimited',
    official_name: 'Chase Freedom Unlimited',
    type: 'credit',
    subtype: 'credit card',
    balances: { current: -1250.75, available: 8749.25, iso_currency_code: 'USD', limit: 10000 },
    institution_id: 'ins_001',
    mask: '9012',
  },
]

// Generate realistic mock transactions (Plaid shape)
function generateTransactions() {
  const today = new Date()
  const txns = []
  let id = 1

  const templates = [
    { name: 'Starbucks',             merchant: 'Starbucks',         category: 'food_dining',     min: 4,   max: 12  },
    { name: 'Whole Foods Market',    merchant: 'Whole Foods',       category: 'groceries',       min: 40,  max: 200 },
    { name: 'Amazon',                merchant: 'Amazon',            category: 'shopping',        min: 15,  max: 150 },
    { name: 'Netflix',               merchant: 'Netflix',           category: 'subscriptions',   min: 15,  max: 15  },
    { name: 'Spotify',               merchant: 'Spotify',           category: 'subscriptions',   min: 10,  max: 10  },
    { name: 'Uber',                  merchant: 'Uber',              category: 'transportation',  min: 8,   max: 35  },
    { name: 'Chipotle',              merchant: 'Chipotle',          category: 'food_dining',     min: 10,  max: 18  },
    { name: 'Target',                merchant: 'Target',            category: 'shopping',        min: 25,  max: 120 },
    { name: 'CVS Pharmacy',          merchant: 'CVS',               category: 'health_fitness',  min: 8,   max: 60  },
    { name: 'Shell Gas Station',     merchant: 'Shell',             category: 'transportation',  min: 45,  max: 80  },
    { name: 'Planet Fitness',        merchant: 'Planet Fitness',    category: 'health_fitness',  min: 25,  max: 25  },
    { name: 'Payroll Deposit',       merchant: null,                category: 'income',          min: -3200, max: -2800 },
    { name: 'Rent Payment',          merchant: null,                category: 'housing',         min: 1800, max: 1800 },
    { name: 'Electric Bill',         merchant: 'Duke Energy',       category: 'utilities',       min: 80,  max: 150 },
    { name: 'Internet Service',      merchant: 'Comcast',           category: 'utilities',       min: 70,  max: 90  },
    { name: 'Apple One',             merchant: 'Apple',             category: 'subscriptions',   min: 30,  max: 30  },
    { name: 'Trader Joes',           merchant: "Trader Joe's",      category: 'groceries',       min: 30,  max: 120 },
    { name: 'Gym Membership',        merchant: 'Equinox',           category: 'health_fitness',  min: 80,  max: 80  },
  ]

  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))
    const tmpl = templates[Math.floor(Math.random() * templates.length)]
    const amount = parseFloat(
      (tmpl.min + Math.random() * (tmpl.max - tmpl.min)).toFixed(2)
    )

    txns.push({
      transaction_id: `txn_mock_${id++}`,
      account_id: 'acc_plaid_001',
      amount,
      iso_currency_code: 'USD',
      date: date.toISOString().split('T')[0],
      name: tmpl.name,
      merchant_name: tmpl.merchant,
      category_id: tmpl.category,
      personal_finance_category: { primary: tmpl.category },
      pending: false,
    })
  }

  return txns.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const MOCK_PLAID_TRANSACTIONS = generateTransactions()
