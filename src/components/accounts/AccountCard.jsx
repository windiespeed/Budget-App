import { CreditCard, Landmark, TrendingUp, Wallet, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import Badge from '../ui/Badge'

const TYPE_CONFIG = {
  checking:   { icon: Wallet,    label: 'Checking',    color: 'blue' },
  savings:    { icon: Landmark,  label: 'Savings',     color: 'green' },
  credit:     { icon: CreditCard, label: 'Credit',     color: 'red' },
  investment: { icon: TrendingUp, label: 'Investment', color: 'purple' },
  loan:       { icon: Landmark,  label: 'Loan',        color: 'yellow' },
}

export default function AccountCard({ account, onDelete }) {
  const config = TYPE_CONFIG[account.account_type] || TYPE_CONFIG.checking
  const Icon = config.icon
  const isCredit = account.account_type === 'credit'
  const balance = account.balance

  const txnUrl = `/transactions?accountId=${account.id}&accountName=${encodeURIComponent(account.name)}`

  return (
    <Link to={txnUrl} className="block bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{account.name}</p>
            <p className="text-xs text-gray-500">{account.institution_name || 'Manual account'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={config.color}>{config.label}</Badge>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(account.id) }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-0.5">{isCredit ? 'Balance Owed' : 'Current Balance'}</p>
        <p className={`text-2xl font-bold ${isCredit ? 'text-red-600' : 'text-gray-900'}`}>
          {isCredit ? '-' : ''}{formatCurrency(Math.abs(balance))}
        </p>
      </div>

      {!account.is_manual && (
        <p className="mt-3 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1 inline-block">
          Connected via Plaid
        </p>
      )}
    </Link>
  )
}
