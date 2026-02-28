import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, TrendingDown, TrendingUp, Repeat, Link2 } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useBudgets } from '../hooks/useBudgets'
import StatCard from '../components/dashboard/StatCard'
import SpendingChart from '../components/dashboard/SpendingChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import AccountsSummary from '../components/dashboard/AccountsSummary'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

// Get current month's date range
function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { startDate: start, endDate: end }
}

// Last 30 days range for chart
function last30Days() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { accounts, totalBalance, loading: acctLoading } = useAccounts()
  const { transactions: monthTxns, totalSpending, totalIncome, loading: txnLoading } = useTransactions(currentMonthRange())
  const { transactions: chartTxns } = useTransactions(last30Days())
  const { totalMonthly: subMonthly, upcoming } = useSubscriptions()
  const { totalBudgeted, totalSpent } = useBudgets()

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const budgetRemaining = totalBudgeted - totalSpent
  const noAccounts = !acctLoading && accounts.length === 0
  const noTransactions = !txnLoading && monthTxns.length === 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Good morning, {userName} 👋</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Empty state CTA */}
      {noAccounts && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Connect your bank to get started</h3>
              <p className="text-indigo-200 text-sm mb-4">
                Link your accounts to see real-time balances, transactions, and insights.
              </p>
              <Link
                to="/accounts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors"
              >
                <Link2 className="w-4 h-4" />
                Connect Bank
              </Link>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Worth"
          amount={totalBalance}
          subtitle={`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
          icon={Wallet}
          color={totalBalance >= 0 ? 'indigo' : 'red'}
        />
        <StatCard
          title="This Month Spent"
          amount={totalSpending}
          subtitle="expenses this month"
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="This Month Income"
          amount={totalIncome}
          subtitle="income this month"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Subscriptions"
          amount={subMonthly}
          subtitle={`${upcoming.length} due this week`}
          icon={Repeat}
          color="amber"
        />
      </div>

      {/* Spending Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Spending & Income — Last 30 Days</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Spending</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Income</span>
          </div>
        </div>
        <SpendingChart transactions={chartTxns} />
      </div>

      {/* Budget summary + Accounts */}
      {totalBudgeted > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Monthly Budget</h2>
            <Link to="/budget" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Manage →</Link>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">
              {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudgeted)}
            </span>
            <span className={`font-semibold ${budgetRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {budgetRemaining < 0 ? '-' : ''}{formatCurrency(Math.abs(budgetRemaining))} {budgetRemaining < 0 ? 'over' : 'remaining'}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalBudgeted > 0 && totalSpent / totalBudgeted >= 1 ? 'bg-red-500' : totalSpent / totalBudgeted >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0)}%` }}
            />
          </div>
        </div>
      )}

      {/* Two-column: Recent Transactions + Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <RecentTransactions transactions={monthTxns} loading={txnLoading} />
        </div>
        <div className="lg:col-span-2">
          <AccountsSummary accounts={accounts} />
        </div>
      </div>
    </div>
  )
}
