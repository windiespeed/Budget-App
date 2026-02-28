import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function StatCard({ title, amount, subtitle, trend, icon: Icon, color = 'indigo' }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', text: 'text-indigo-600' },
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-600' },
    red:    { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' },
    amber:  { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-600' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-5 shadow-sm">
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <p className="text-xs md:text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center ${c.bg}`}>
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${c.icon}`} />
          </div>
        )}
      </div>
      <p className={`text-lg md:text-2xl font-bold ${c.text} mb-1`}>
        {formatCurrency(Math.abs(amount))}
      </p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  )
}
