export const CATEGORIES = [
  { id: 'food_dining',      label: 'Food & Dining',       color: '#f97316', bg: 'bg-orange-100',  text: 'text-orange-700', icon: '🍔' },
  { id: 'groceries',        label: 'Groceries',           color: '#84cc16', bg: 'bg-lime-100',    text: 'text-lime-700',   icon: '🛒' },
  { id: 'transportation',   label: 'Transportation',      color: '#3b82f6', bg: 'bg-blue-100',    text: 'text-blue-700',   icon: '🚗' },
  { id: 'shopping',         label: 'Shopping',            color: '#ec4899', bg: 'bg-pink-100',    text: 'text-pink-700',   icon: '🛍️' },
  { id: 'entertainment',    label: 'Entertainment',       color: '#8b5cf6', bg: 'bg-violet-100',  text: 'text-violet-700', icon: '🎬' },
  { id: 'health_fitness',   label: 'Health & Fitness',    color: '#14b8a6', bg: 'bg-teal-100',    text: 'text-teal-700',   icon: '🏥' },
  { id: 'utilities',        label: 'Utilities',           color: '#f59e0b', bg: 'bg-amber-100',   text: 'text-amber-700',  icon: '⚡' },
  { id: 'housing',          label: 'Housing',             color: '#6366f1', bg: 'bg-indigo-100',  text: 'text-indigo-700', icon: '🏠' },
  { id: 'subscriptions',    label: 'Subscriptions',       color: '#0ea5e9', bg: 'bg-sky-100',     text: 'text-sky-700',    icon: '📱' },
  { id: 'travel',           label: 'Travel',              color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700',icon: '✈️' },
  { id: 'education',        label: 'Education',           color: '#78716c', bg: 'bg-stone-100',   text: 'text-stone-700',  icon: '📚' },
  { id: 'personal_care',    label: 'Personal Care',       color: '#f43f5e', bg: 'bg-rose-100',    text: 'text-rose-700',   icon: '💅' },
  { id: 'income',           label: 'Income',              color: '#22c55e', bg: 'bg-green-100',   text: 'text-green-700',  icon: '💰' },
  { id: 'transfer',         label: 'Transfer',            color: '#94a3b8', bg: 'bg-slate-100',   text: 'text-slate-700',  icon: '↔️' },
  { id: 'other',            label: 'Other',               color: '#6b7280', bg: 'bg-gray-100',    text: 'text-gray-700',   icon: '📦' },
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES.find(c => c.id === 'other')
}

export const BUDGET_CATEGORIES = CATEGORIES.filter(c => c.id !== 'income' && c.id !== 'transfer')

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Streaming',
  'Software',
  'News & Media',
  'Health & Fitness',
  'Education',
  'Gaming',
  'Utilities',
  'Cloud Storage',
  'Music',
  'Other',
]

export const BILLING_CYCLES = [
  { value: 'monthly',    label: 'Monthly' },
  { value: 'yearly',     label: 'Yearly' },
  { value: 'quarterly',  label: 'Quarterly' },
  { value: 'weekly',     label: 'Weekly' },
  { value: 'biweekly',   label: 'Bi-weekly' },
]

export const ACCOUNT_TYPES = [
  { value: 'checking',    label: 'Checking' },
  { value: 'savings',     label: 'Savings' },
  { value: 'credit',      label: 'Credit Card' },
  { value: 'investment',  label: 'Investment' },
  { value: 'loan',        label: 'Loan' },
]
