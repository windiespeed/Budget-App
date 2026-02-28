import { useState, useMemo } from 'react'
import { PlusCircle, ArrowLeftRight } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import TransactionItem from '../components/transactions/TransactionItem'
import TransactionFilters from '../components/transactions/TransactionFilters'
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function Transactions() {
  const [filters, setFilters] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const { transactions, loading, totalSpending, totalIncome, addTransaction, deleteTransaction } = useTransactions(filters)

  const grouped = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const key = t.transaction_date
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return Object.entries(map).sort(([a], [b]) => new Date(b) - new Date(a))
  }, [transactions])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Spending</p>
          <p className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(totalSpending)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Income</p>
          <p className="text-lg md:text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onChange={setFilters} />

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Transaction list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions</h3>
          <p className="text-gray-500 text-sm">Connect a bank account or add transactions manually</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {grouped.map(([date, txns]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {formatDate(date)}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {formatCurrency(txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))} spent
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {txns.map(t => (
                  <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTransactionModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addTransaction}
      />
    </div>
  )
}
