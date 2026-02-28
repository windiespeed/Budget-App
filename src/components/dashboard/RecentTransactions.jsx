import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import TransactionItem from '../transactions/TransactionItem'

export default function RecentTransactions({ transactions, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Recent Transactions</h2>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No transactions yet</div>
      ) : (
        <div className="divide-y divide-gray-50 px-1">
          {transactions.slice(0, 8).map(t => (
            <TransactionItem key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}
