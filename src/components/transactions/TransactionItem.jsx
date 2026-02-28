import { Trash2 } from 'lucide-react'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import { getCategoryById } from '../../utils/categories'

export default function TransactionItem({ transaction, onDelete }) {
  const category = getCategoryById(transaction.category)
  const isExpense = transaction.amount > 0

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 rounded-lg group transition-colors">
      {/* Category icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${category.bg}`}>
        {category.icon}
      </div>

      {/* Description + merchant */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {transaction.merchant_name || transaction.description}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {transaction.merchant_name ? transaction.description : category.label}
          {transaction.is_pending && (
            <span className="ml-1.5 text-amber-600 font-medium">· Pending</span>
          )}
        </p>
      </div>

      {/* Category badge */}
      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${category.bg} ${category.text} flex-shrink-0`}>
        {category.label}
      </span>

      {/* Date */}
      <span className="text-xs text-gray-400 flex-shrink-0 w-14 text-right">
        {formatDateShort(transaction.transaction_date)}
      </span>

      {/* Amount */}
      <span className={`text-sm font-semibold flex-shrink-0 w-20 text-right ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
        {isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
      </span>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
