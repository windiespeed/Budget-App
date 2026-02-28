import { Search, X } from 'lucide-react'
import { CATEGORIES } from '../../utils/categories'

export default function TransactionFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })
  const clear = () => onChange({})
  const hasFilters = filters.search || filters.category || filters.startDate || filters.endDate

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
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

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        {/* Category filter */}
        <select
          value={filters.category || ''}
          onChange={e => set('category', e.target.value || undefined)}
          className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={e => set('startDate', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={e => set('endDate', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />

        {hasFilters && (
          <button
            onClick={clear}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
