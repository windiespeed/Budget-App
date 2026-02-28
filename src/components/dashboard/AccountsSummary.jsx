import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

const TYPE_COLORS = {
  checking: 'bg-blue-100 text-blue-700',
  savings:  'bg-green-100 text-green-700',
  credit:   'bg-red-100 text-red-700',
  investment: 'bg-purple-100 text-purple-700',
  loan:     'bg-amber-100 text-amber-700',
}

export default function AccountsSummary({ accounts }) {
  const preview = accounts.slice(0, 4)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Accounts</h2>
        <Link to="/accounts" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {preview.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400 mb-3">No accounts connected</p>
          <Link to="/accounts" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Connect your bank →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {preview.map(acc => (
            <div key={acc.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${acc.account_type === 'credit' ? 'bg-red-400' : 'bg-indigo-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                  <p className="text-xs text-gray-500">{acc.institution_name || 'Manual'}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${acc.account_type === 'credit' ? 'text-red-600' : 'text-gray-900'}`}>
                {acc.account_type === 'credit' ? '-' : ''}{formatCurrency(Math.abs(acc.balance))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
