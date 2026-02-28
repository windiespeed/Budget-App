import { Search, X } from 'lucide-react'
import { CATEGORIES } from '../../utils/categories'

export default function TransactionFilters({ filters, onChange, accounts = [] }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })
  const clear = () => onChange({})
  const hasFilters = filters.search || filters.category || filters.startDate || filters.endDate || filters.accountId

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        {/* Account filter */}
        {accounts.length > 0 && (
          <select
            value={filters.accountId || ''}
            onChange={e => set('accountId', e.target.value || undefined)}
            className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 self-end"
          >
            <option value="">All accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}

        {/* Date range */}
        <label className="flex flex-col gap-1 flex-1 min-w-28">
          <span className="text-[11px] text-gray-400 uppercase tracking-wide leading-none pl-0.5">From</span>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={e => set('startDate', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-28">
          <span className="text-[11px] text-gray-400 uppercase tracking-wide leading-none pl-0.5">To</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => set('endDate', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </label>

        {/* Category filter */}
        <select
          value={filters.category || ''}
          onChange={e => set('category', e.target.value || undefined)}
          className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 self-end"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors self-end"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
