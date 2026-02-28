import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusCircle, ArrowLeftRight, X, SlidersHorizontal, ChevronUp } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import TransactionItem from '../components/transactions/TransactionItem'
import TransactionFilters from '../components/transactions/TransactionFilters'
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initAccountId = searchParams.get('accountId')
  const initAccountName = searchParams.get('accountName')

  const [filters, setFilters] = useState(() => initAccountId ? { accountId: initAccountId } : {})
  const [showAdd, setShowAdd] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(true)

  const { accounts } = useAccounts()
  const selectedAccount = accounts.find(a => a.id === filters.accountId)
  const hasActiveFilters = !!(filters.search || filters.category || filters.startDate || filters.endDate || filters.accountId)

  const { transactions, loading, totalSpending, totalIncome, addTransaction, deleteTransaction } = useTransactions(filters)

  const accountMap = useMemo(() => Object.fromEntries(accounts.map(a => [a.id, a.name])), [accounts])

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
      {/* Consolidated toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">Spent</p>
              <p className="text-base font-bold text-red-600 leading-none">{formatCurrency(totalSpending)}</p>
            </div>
            <div className="w-px h-7 bg-gray-200 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">Income</p>
              <p className="text-base font-bold text-emerald-600 leading-none">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {selectedAccount && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 font-medium min-w-0 max-w-36">
                <span className="truncate">{selectedAccount.name}</span>
                <button
                  onClick={() => setFilters(f => { const { accountId, ...rest } = f; return rest })}
                  className="text-indigo-400 hover:text-indigo-700 flex-shrink-0 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg text-sm transition-colors"
            >
              {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && !filtersOpen && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
        {filtersOpen && (
          <>
            <div className="border-t border-gray-100" />
            <TransactionFilters filters={filters} onChange={setFilters} accounts={accounts} />
          </>
        )}
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
                  <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} accountName={accountMap[t.account_id]} />
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
