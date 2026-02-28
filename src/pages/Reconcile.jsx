import { useState, useMemo } from 'react'
import { CheckCircle2, ChevronRight, Scale } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAccounts } from '../hooks/useAccounts'
import { formatCurrency, formatDate } from '../utils/formatters'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const today = new Date().toISOString().split('T')[0]

// ── Setup step ──────────────────────────────────────────────────────────────
function SetupStep({ accounts, onStart }) {
  const [accountId, setAccountId] = useState('')
  const [statementDate, setStatementDate] = useState(today)
  const [statementBalance, setStatementBalance] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accountId || !statementBalance) return
    setLoading(true)
    await onStart({ accountId, statementDate, statementBalance: parseFloat(statementBalance) })
    setLoading(false)
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Start Reconciliation</h2>
            <p className="text-xs text-gray-500">Match your transactions to your bank statement</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select an account…</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.institution_name ? ` — ${a.institution_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ending Date</label>
            <input
              type="date"
              value={statementDate}
              onChange={e => setStatementDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ending Balance</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={statementBalance}
                onChange={e => setStatementBalance(e.target.value.replace(/[^0-9.]/g, ''))}
                required
                placeholder="0.00"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter the ending balance from your bank statement</p>
          </div>

          <button
            type="submit"
            disabled={loading || !accountId || !statementBalance}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : <>Start Reconciliation <ChevronRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Summary bar ──────────────────────────────────────────────────────────────
function SummaryBar({ beginningBalance, clearedDeposits, clearedPayments, clearedBalance, statementBalance, difference }) {
  const balanced = Math.abs(difference) < 0.005

  const items = [
    { label: 'Beginning Balance', value: formatCurrency(beginningBalance), color: 'text-gray-900' },
    { label: '+ Cleared Deposits', value: formatCurrency(clearedDeposits), color: 'text-emerald-600' },
    { label: '− Cleared Payments', value: formatCurrency(clearedPayments), color: 'text-red-600' },
    { label: '= Cleared Balance', value: formatCurrency(clearedBalance), color: 'text-gray-900', bold: true },
    { label: 'Statement Balance', value: formatCurrency(statementBalance), color: 'text-gray-900', bold: true },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map(({ label, value, color, bold }) => (
          <div key={label}>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm font-${bold ? 'bold' : 'semibold'} ${color}`}>{value}</p>
          </div>
        ))}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Difference</p>
          <p className={`text-sm font-bold ${balanced ? 'text-emerald-600' : 'text-red-600'}`}>
            {balanced ? '✓ $0.00' : (difference > 0 ? '+' : '') + formatCurrency(difference)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Reconciling step ──────────────────────────────────────────────────────────
function ReconcilingStep({ transactions, clearedIds, onToggle, onFinish, onCancel, summaryProps, loading }) {
  const balanced = Math.abs(summaryProps.difference) < 0.005
  const payments = transactions.filter(t => t.amount > 0)
  const deposits = transactions.filter(t => t.amount < 0)

  const TransactionRow = ({ t }) => {
    const cleared = clearedIds.has(t.id)
    return (
      <div
        onClick={() => onToggle(t.id)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${cleared ? 'bg-emerald-50/40' : ''}`}
      >
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${cleared ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
          {cleared && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
          <p className="text-xs text-gray-400">{formatDate(t.transaction_date)}</p>
        </div>
        <span className={`text-sm font-semibold flex-shrink-0 ${t.amount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {t.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(t.amount))}
        </span>
      </div>
    )
  }

  const Section = ({ title, txns, count }) => (
    <div>
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <span className="text-xs text-gray-400">{count} cleared</span>
      </div>
      {txns.length === 0 ? (
        <p className="px-4 py-4 text-sm text-gray-400 text-center">No transactions</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {txns.map(t => <TransactionRow key={t.id} t={t} />)}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <SummaryBar {...summaryProps} />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Section
          title="Payments & Debits"
          txns={payments}
          count={payments.filter(t => clearedIds.has(t.id)).length}
        />
        <div className="border-t border-gray-200">
          <Section
            title="Deposits & Credits"
            txns={deposits}
            count={deposits.filter(t => clearedIds.has(t.id)).length}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {!balanced && (
            <p className="text-sm text-red-600 font-medium hidden sm:block">
              Difference must be $0.00 to finish
            </p>
          )}
          <button
            onClick={onFinish}
            disabled={!balanced || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Finish Reconciliation'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Done step ─────────────────────────────────────────────────────────────────
function DoneStep({ account, statementDate, statementBalance, onStartNew }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Reconciliation Complete</h2>
        <p className="text-gray-500 text-sm mb-1">
          <span className="font-medium text-gray-700">{account?.name}</span> balanced as of{' '}
          <span className="font-medium text-gray-700">{formatDate(statementDate)}</span>
        </p>
        <p className="text-2xl font-bold text-emerald-600 mt-3 mb-6">{formatCurrency(statementBalance)}</p>
        <button
          onClick={onStartNew}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Reconcile Another Account
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Reconcile() {
  const { user } = useAuth()
  const { accounts, loading: acctLoading } = useAccounts()

  const [step, setStep] = useState('setup')
  const [sessionData, setSessionData] = useState(null) // { accountId, statementDate, statementBalance }
  const [transactions, setTransactions] = useState([])
  const [clearedIds, setClearedIds] = useState(new Set())
  const [beginningBalance, setBeginningBalance] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleStart = async ({ accountId, statementDate, statementBalance }) => {
    // Load only uncleared transactions up to statement date
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('account_id', accountId)
      .eq('is_cleared', false)
      .lte('transaction_date', statementDate)
      .order('transaction_date', { ascending: false })

    setTransactions(txns || [])
    setClearedIds(new Set()) // none pre-checked — all loaded transactions are uncleared

    // Beginning balance: use last reconciliation if exists, otherwise use account's balance
    const [{ data: lastRecon }, { data: account }] = await Promise.all([
      supabase
        .from('reconciliations')
        .select('statement_balance')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('accounts')
        .select('balance')
        .eq('id', accountId)
        .single(),
    ])

    setBeginningBalance(lastRecon?.statement_balance ?? account?.balance ?? 0)
    setSessionData({ accountId, statementDate, statementBalance })
    setStep('reconciling')
  }

  const toggleCleared = (id) => {
    setClearedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleFinish = async () => {
    setSaving(true)
    const { accountId, statementDate, statementBalance } = sessionData
    const clearedArr = [...clearedIds]

    if (clearedArr.length > 0) {
      await supabase.from('transactions').update({ is_cleared: true }).in('id', clearedArr)
    }
    await supabase.from('reconciliations').insert({
      user_id: user.id,
      account_id: accountId,
      statement_date: statementDate,
      statement_balance: statementBalance,
      cleared_balance: clearedBalance,
    })

    setSaving(false)
    setStep('done')
  }

  // Compute summary stats
  const clearedTxns = transactions.filter(t => clearedIds.has(t.id))
  const clearedDeposits = clearedTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const clearedPayments = clearedTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const clearedBalance = beginningBalance + clearedDeposits - clearedPayments
  const difference = (sessionData?.statementBalance ?? 0) - clearedBalance

  const summaryProps = {
    beginningBalance,
    clearedDeposits,
    clearedPayments,
    clearedBalance,
    statementBalance: sessionData?.statementBalance ?? 0,
    difference,
  }

  const selectedAccount = accounts.find(a => a.id === sessionData?.accountId)

  if (acctLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-5">
      {step === 'setup' && (
        <SetupStep accounts={accounts} onStart={handleStart} />
      )}
      {step === 'reconciling' && (
        <ReconcilingStep
          transactions={transactions}
          clearedIds={clearedIds}
          onToggle={toggleCleared}
          onFinish={handleFinish}
          onCancel={() => setStep('setup')}
          summaryProps={summaryProps}
          loading={saving}
        />
      )}
      {step === 'done' && (
        <DoneStep
          account={selectedAccount}
          statementDate={sessionData.statementDate}
          statementBalance={sessionData.statementBalance}
          onStartNew={() => { setStep('setup'); setSessionData(null) }}
        />
      )}
    </div>
  )
}
