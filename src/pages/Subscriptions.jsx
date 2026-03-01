import { useMemo, useState } from 'react'
import { PlusCircle, Receipt, AlertCircle } from 'lucide-react'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useAccounts } from '../hooks/useAccounts'
import SubscriptionCard from '../components/subscriptions/SubscriptionCard'
import AddSubscriptionModal from '../components/subscriptions/AddSubscriptionModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function Subscriptions() {
  const [showAdd, setShowAdd] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [statusFilter, setStatusFilter] = useState('active')

  const {
    subscriptions, loading, totalMonthly, totalMonthlyIncome, totalAnnual, upcoming,
    addSubscription, updateSubscription, deleteSubscription, activeCount
  } = useSubscriptions()

  const { accounts } = useAccounts()

  const accountMap = useMemo(() =>
    Object.fromEntries(accounts.map(a => [a.id, a.name])),
    [accounts]
  )

  const handleSave = async (data, id) => {
    if (id) await updateSubscription(id, data)
    else await addSubscription(data)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return
    await deleteSubscription(id)
  }

  const handleToggle = async (id, newStatus) => {
    await updateSubscription(id, { status: newStatus })
  }

  const filtered = subscriptions.filter(s =>
    statusFilter === 'all' ? true : s.status === statusFilter
  )

  // Group by type; treat legacy 'expense' as bill
  const billsSection = filtered.filter(s => s.entry_type === 'bill' || s.entry_type === 'expense')
  const subsSection  = filtered.filter(s => s.entry_type === 'subscription')
  const incomeSection = filtered.filter(s => s.entry_type === 'income')
  const hasItems = filtered.length > 0

  const netMonthly = totalMonthlyIncome - totalMonthly

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Monthly Expenses</p>
          <p className="text-lg md:text-2xl font-bold text-red-600">{formatCurrency(totalMonthly)}</p>
          <p className="text-xs text-gray-400">{activeCount} active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
          <p className="text-lg md:text-2xl font-bold text-emerald-600">+{formatCurrency(totalMonthlyIncome)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Net Monthly</p>
          <p className={`text-lg md:text-2xl font-bold ${netMonthly >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {netMonthly >= 0 ? '+' : ''}{formatCurrency(netMonthly)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Due Soon</p>
          <p className="text-lg md:text-2xl font-bold text-amber-600">{upcoming.length}</p>
          {upcoming.length > 0 && (
            <p className="text-xs text-gray-400 truncate">{upcoming[0]?.name}</p>
          )}
        </div>
      </div>

      {/* Upcoming bills alert */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Upcoming bills in the next 7 days</p>
              <div className="space-y-1">
                {upcoming.map(s => (
                  <p key={s.id} className="text-xs text-amber-700">
                    <span className="font-medium">{s.name}</span> — {formatCurrency(s.amount)} on {formatDate(s.next_billing_date)}
                    {s.is_autopay && <span className="ml-1.5 text-emerald-700">(Autopay)</span>}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {['active', 'paused', 'cancelled', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 md:px-3 py-1.5 rounded-md text-xs md:text-sm font-medium capitalize transition-all whitespace-nowrap ${
                statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditSub(null); setShowAdd(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : !hasItems ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries yet</h3>
          <p className="text-gray-500 text-sm mb-5">Track recurring bills, subscriptions, and expected income</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Add your first entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {billsSection.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Bills <span className="font-normal text-gray-400 normal-case">({billsSection.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {billsSection.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    accountName={sub.account_id ? accountMap[sub.account_id] : null}
                    onEdit={(s) => { setEditSub(s); setShowAdd(true) }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </section>
          )}

          {subsSection.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Subscriptions <span className="font-normal text-gray-400 normal-case">({subsSection.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subsSection.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    accountName={sub.account_id ? accountMap[sub.account_id] : null}
                    onEdit={(s) => { setEditSub(s); setShowAdd(true) }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </section>
          )}

          {incomeSection.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Income <span className="font-normal text-gray-400 normal-case">({incomeSection.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeSection.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    accountName={sub.account_id ? accountMap[sub.account_id] : null}
                    onEdit={(s) => { setEditSub(s); setShowAdd(true) }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <AddSubscriptionModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditSub(null) }}
        onSave={handleSave}
        existing={editSub}
        accounts={accounts}
      />
    </div>
  )
}
