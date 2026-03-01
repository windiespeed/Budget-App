import { Pencil, Trash2, Calendar, Pause, Play, Zap } from 'lucide-react'
import { formatCurrency, formatDate, annualToMonthly } from '../../utils/formatters'
import Badge from '../ui/Badge'

const CYCLE_LABELS = {
  monthly: '/mo', yearly: '/yr', quarterly: '/qtr', weekly: '/wk', biweekly: '/2wk'
}

const STATUS_CONFIG = {
  active:    { color: 'green',  label: 'Active' },
  paused:    { color: 'yellow', label: 'Paused' },
  cancelled: { color: 'gray',   label: 'Cancelled' },
}

export default function SubscriptionCard({ subscription: sub, onEdit, onDelete, onToggle, accountName }) {
  const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active
  const monthlyEquiv = annualToMonthly(sub.amount, sub.billing_cycle)
  const bgColor = sub.color || '#6366f1'
  const isIncome = sub.entry_type === 'income'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        {/* Icon / Logo */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
          style={{ backgroundColor: bgColor }}
        >
          {sub.name[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{sub.name}</p>
              {sub.category && <p className="text-xs text-gray-500">{sub.category}</p>}
            </div>
            <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-2">
        <p className={`text-xl font-bold ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : ''}{formatCurrency(sub.amount)}
          <span className="text-sm font-normal text-gray-500 ml-0.5">{CYCLE_LABELS[sub.billing_cycle] || ''}</span>
        </p>
        {sub.billing_cycle !== 'monthly' && (
          <p className="text-xs text-gray-500">
            {isIncome ? '+' : ''}{formatCurrency(monthlyEquiv)}/mo equiv.
          </p>
        )}
      </div>

      {/* Chips row: autopay + account */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {sub.is_autopay && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> Autopay
          </span>
        )}
        {accountName && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{accountName}</span>
        )}
      </div>

      {/* Next billing */}
      {sub.next_billing_date && sub.status === 'active' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Next: {formatDate(sub.next_billing_date)}</span>
        </div>
      )}

      {sub.notes && (
        <p className="text-xs text-gray-400 italic mb-2 truncate">{sub.notes}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
        {onToggle && sub.status !== 'cancelled' && !isIncome && (
          <button
            onClick={() => onToggle(sub.id, sub.status === 'active' ? 'paused' : 'active')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sub.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {sub.status === 'active' ? 'Pause' : 'Resume'}
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(sub)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(sub.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
