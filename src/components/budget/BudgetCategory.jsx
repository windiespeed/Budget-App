import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { getCategoryById } from '../../utils/categories'

export default function BudgetCategory({ budget, onEdit, onDelete }) {
  const category = getCategoryById(budget.category)
  const isOverBudget = budget.percentUsed >= 100
  const isWarning = budget.percentUsed >= 80 && !isOverBudget

  const barColor = isOverBudget
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${category.bg}`}>
            {category.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{category.label}</p>
            <p className={`text-xs ${isOverBudget ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {isOverBudget
                ? `Over by ${formatCurrency(Math.abs(budget.remaining))}`
                : `${formatCurrency(budget.remaining)} left`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Spent: <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(budget.spent)}
          </span>
        </span>
        <span className="text-xs text-gray-500">
          Budget: <span className="font-semibold text-gray-900">{formatCurrency(budget.amount)}</span>
        </span>
        <span className={`text-xs font-bold ${isOverBudget ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
          {budget.percentUsed}%
        </span>
      </div>
    </div>
  )
}
