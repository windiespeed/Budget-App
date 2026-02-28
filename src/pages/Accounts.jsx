import { useState } from 'react'
import { PlusCircle, Link2 } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import AccountCard from '../components/accounts/AccountCard'
import AddAccountModal from '../components/accounts/AddAccountModal'
import PlaidLinkButton from '../components/accounts/PlaidLinkButton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency } from '../utils/formatters'

export default function Accounts() {
  const { accounts, loading, totalBalance, addAccount, deleteAccount, fetchAccounts } = useAccounts()
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = async (data) => {
    await addAccount(data)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this account?')) return
    await deleteAccount(id)
  }

  const depositAccounts = accounts.filter(a => ['checking', 'savings'].includes(a.account_type))
  const creditAccounts = accounts.filter(a => a.account_type === 'credit')
  const investmentAccounts = accounts.filter(a => ['investment', 'loan'].includes(a.account_type))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm self-start sm:self-auto">
          <p className="text-xs text-gray-500">Net Worth</p>
          <p className={`text-xl md:text-2xl font-bold ${totalBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Manual
          </button>
          <PlaidLinkButton onSuccess={fetchAccounts} />
        </div>
      </div>

      {accounts.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500 text-sm mb-6">Connect your bank to see real-time balances and transactions</p>
          <div className="flex justify-center gap-3">
            <PlaidLinkButton onSuccess={fetchAccounts} />
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-colors"
            >
              Add manually
            </button>
          </div>
        </div>
      ) : (
        <>
          {depositAccounts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cash Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {depositAccounts.map(acc => (
                  <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {creditAccounts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Credit Cards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditAccounts.map(acc => (
                  <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {investmentAccounts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Investments & Loans</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {investmentAccounts.map(acc => (
                  <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AddAccountModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}
