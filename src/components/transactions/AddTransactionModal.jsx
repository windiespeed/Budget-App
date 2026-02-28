import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { CATEGORIES } from '../../utils/categories'
import { useAccounts } from '../../hooks/useAccounts'

export default function AddTransactionModal({ open, onClose, onAdd }) {
  const { accounts } = useAccounts()
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      category: 'other',
      transaction_date: new Date().toISOString().split('T')[0],
      type: 'expense',
    }
  })

  const transactionType = watch('type')

  const onSubmit = async (data) => {
    const rawAmount = parseFloat(data.amount) || 0
    // Expense = positive, Income = negative (Plaid convention)
    const amount = data.type === 'income' ? -Math.abs(rawAmount) : Math.abs(rawAmount)

    await onAdd({
      description: data.description,
      merchant_name: data.merchant_name || null,
      amount,
      category: data.category,
      transaction_date: data.transaction_date,
      account_id: data.account_id || null,
      is_pending: false,
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
          {['expense', 'income'].map(t => (
            <label
              key={t}
              className={`flex-1 text-center py-2 rounded-md text-sm font-medium cursor-pointer transition-all capitalize ${
                transactionType === t
                  ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input type="radio" value={t} className="sr-only" {...register('type')} />
              {t}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Grocery run"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Merchant / Payee</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Whole Foods"
            {...register('merchant_name')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('transaction_date', { required: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('category')}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('account_id')}
            >
              <option value="">No account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Add Transaction
          </button>
        </div>
      </form>
    </Modal>
  )
}
