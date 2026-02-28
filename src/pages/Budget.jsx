import { useState } from 'react'
import { PlusCircle, ChevronLeft, ChevronRight, PieChart } from 'lucide-react'
import { useBudgets } from '../hooks/useBudgets'
import BudgetCategory from '../components/budget/BudgetCategory'
import AddBudgetModal from '../components/budget/AddBudgetModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, formatPercent } from '../utils/formatters'

export default function Budget() {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [showAdd, setShowAdd] = useState(false)
  const [editBudget, setEditBudget] = useState(null)

  const { budgets, loading, upsertBudget, deleteBudget, totalBudgeted, totalSpent } = useBudgets(viewMonth, viewYear)

  const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleSave = async (category, amount) => {
    await upsertBudget(category, amount)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this budget?')) return
    await deleteBudget(id)
  }

  const overBudgetCount = budgets.filter(b => b.percentUsed >= 100).length
  const totalPercent = formatPercent(totalSpent, totalBudgeted)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Month nav + summary */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 md:gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm md:text-base font-semibold text-gray-900 w-28 md:w-40 text-center">{monthLabel}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => { setEditBudget(null); setShowAdd(true) }}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs md:text-sm transition-colors shadow-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Overview card */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Monthly Overview</p>
              <p className="text-xs text-gray-500">
                {overBudgetCount > 0 && <span className="text-red-600 font-medium">{overBudgetCount} over budget · </span>}
                {formatCurrency(totalSpent)} of {formatCurrency(totalBudgeted)} spent
              </p>
            </div>
            <span className={`text-2xl font-bold ${totalPercent >= 100 ? 'text-red-600' : totalPercent >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {totalPercent}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalPercent >= 100 ? 'bg-red-500' : totalPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, totalPercent)}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-500 text-sm mb-5">Set monthly spending limits per category to track your finances</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Add your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <BudgetCategory
              key={b.id}
              budget={b}
              onEdit={(b) => { setEditBudget(b); setShowAdd(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddBudgetModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditBudget(null) }}
        onSave={handleSave}
        existing={editBudget}
      />
    </div>
  )
}
