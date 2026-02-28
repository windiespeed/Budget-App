import { Link } from 'react-router-dom'
import { CreditCard, ArrowLeftRight, PieChart, Repeat, Wallet, Link2, TrendingUp, TrendingDown } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useBudgets } from '../hooks/useBudgets'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { startDate: start, endDate: end }
}

function QuickCard({ to, icon: Icon, label, primary, secondary, iconBg, iconColor }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-3"
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-tight">{primary}</p>
        {secondary && <p className="text-xs text-gray-400 mt-0.5">{secondary}</p>}
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { accounts, totalBalance, loading: acctLoading } = useAccounts()
  const { transactions: monthTxns, totalSpending, totalIncome, loading: txnLoading } = useTransactions(currentMonthRange())
  const { totalMonthly: subMonthly, upcoming } = useSubscriptions()
  const { totalBudgeted, totalSpent } = useBudgets()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const noAccounts = !acctLoading && accounts.length === 0
  const budgetRemaining = totalBudgeted - totalSpent

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{greeting}, {userName}</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Connect bank CTA — shown when no accounts */}
      {noAccounts && (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
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
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Net worth hero */}
      {!noAccounts && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Net Worth</p>
          <p className={`text-4xl font-bold mb-5 ${totalBalance < 0 ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(totalBalance)}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Income
              </p>
              <p className="text-emerald-400 font-semibold text-sm">{formatCurrency(totalIncome)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Spent
              </p>
              <p className="text-red-400 font-semibold text-sm">{formatCurrency(totalSpending)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Subscriptions</p>
              <p className="text-white font-semibold text-sm">{formatCurrency(subMonthly)}/mo</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 gap-3">
        <QuickCard
          to="/accounts"
          icon={CreditCard}
          label="Accounts"
          primary={`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
          secondary={`${formatCurrency(Math.abs(totalBalance))} total balance`}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <QuickCard
          to="/transactions"
          icon={ArrowLeftRight}
          label="Transactions"
          primary={`${monthTxns.length} this month`}
          secondary={`${formatCurrency(totalSpending)} spent`}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <QuickCard
          to="/budget"
          icon={PieChart}
          label="Budget"
          primary={
            totalBudgeted > 0
              ? formatCurrency(Math.abs(budgetRemaining))
              : 'Not set'
          }
          secondary={
            totalBudgeted > 0
              ? `${budgetRemaining >= 0 ? 'remaining of' : 'over'} ${formatCurrency(totalBudgeted)}`
              : 'Set a monthly budget'
          }
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <QuickCard
          to="/subscriptions"
          icon={Repeat}
          label="Subscriptions"
          primary={`${formatCurrency(subMonthly)}/mo`}
          secondary={upcoming.length > 0 ? `${upcoming.length} due this week` : 'No upcoming bills'}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Recent transactions */}
      <RecentTransactions transactions={monthTxns} loading={txnLoading} />

    </div>
  )
}
