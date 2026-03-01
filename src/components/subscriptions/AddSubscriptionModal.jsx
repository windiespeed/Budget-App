import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLES } from '../../utils/categories'

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#14b8a6', '#3b82f6',
  '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9',
]

export default function AddSubscriptionModal({ open, onClose, onSave, existing, accounts = [] }) {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      entry_type: 'bill',
      billing_cycle: 'monthly',
      status: 'active',
      color: '#6366f1',
      category: 'Entertainment',
      is_autopay: false,
      account_id: '',
    }
  })

  useEffect(() => {
    if (existing) {
      reset({
        // map legacy 'expense' to 'bill'
        entry_type: existing.entry_type === 'expense' ? 'bill' : (existing.entry_type || 'bill'),
        name: existing.name,
        amount: existing.amount,
        billing_cycle: existing.billing_cycle,
        next_billing_date: existing.next_billing_date || '',
        category: existing.category || 'Entertainment',
        status: existing.status,
        website_url: existing.website_url || '',
        color: existing.color || '#6366f1',
        notes: existing.notes || '',
        is_autopay: existing.is_autopay || false,
        account_id: existing.account_id || '',
      })
    } else {
      reset({
        entry_type: 'bill',
        billing_cycle: 'monthly',
        status: 'active',
        color: '#6366f1',
        category: 'Entertainment',
        is_autopay: false,
        account_id: '',
      })
    }
  }, [existing, reset, open])

  const selectedColor = watch('color')
  const entryType = watch('entry_type')
  const isIncome = entryType === 'income'
  const isBill = entryType === 'bill'

  const TYPE_LABELS = { bill: 'Bill', subscription: 'Subscription', income: 'Income' }
  const NAME_PLACEHOLDER = { bill: 'e.g. Electric Bill', subscription: 'e.g. Netflix', income: 'e.g. Salary' }
  const NAME_LABEL = { bill: 'Bill name', subscription: 'Subscription name', income: 'Income source name' }

  const onSubmit = async (data) => {
    await onSave({
      entry_type: data.entry_type,
      name: data.name,
      amount: parseFloat(data.amount),
      billing_cycle: data.billing_cycle,
      next_billing_date: data.next_billing_date || null,
      category: data.category,
      status: data.status,
      website_url: data.website_url || null,
      color: data.color,
      notes: data.notes || null,
      is_autopay: !isIncome && data.is_autopay,
      account_id: data.account_id || null,
    }, existing?.id)
    reset()
    onClose()
  }

  const modalTitle = existing
    ? `Edit ${TYPE_LABELS[existing.entry_type === 'expense' ? 'bill' : (existing.entry_type || 'bill')]}`
    : `Add ${TYPE_LABELS[entryType] || 'Entry'}`

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Entry type toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {[
            { value: 'bill',         label: 'Bill',         active: 'bg-red-50 text-red-700' },
            { value: 'subscription', label: 'Subscription', active: 'bg-indigo-50 text-indigo-700' },
            { value: 'income',       label: 'Income',       active: 'bg-emerald-50 text-emerald-700' },
          ].map(({ value, label, active }, i, arr) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('entry_type', value)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${i < arr.length - 1 ? 'border-r border-gray-200' : ''} ${entryType === value ? active : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {NAME_LABEL[entryType] || 'Name'} *
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={NAME_PLACEHOLDER[entryType] || ''}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="9.99"
                {...register('amount', { required: 'Amount is required', min: 0.01 })}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing cycle *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('billing_cycle', { required: true })}
            >
              {BILLING_CYCLES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('account_id')}
            >
              <option value="">No specific account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.institution_name ? ` — ${a.institution_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('category')}
            >
              {SUBSCRIPTION_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next billing date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('next_billing_date')}
            />
          </div>

          {!isIncome && (
            <div className="col-span-2 flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="is_autopay"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                {...register('is_autopay')}
              />
              <label htmlFor="is_autopay" className="text-sm font-medium text-gray-700 cursor-pointer">
                Autopay enabled
              </label>
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://netflix.com"
              {...register('website_url')}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: selectedColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional notes..."
              {...register('notes')}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            {existing ? 'Save Changes' : `Add ${TYPE_LABELS[entryType] || 'Entry'}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
