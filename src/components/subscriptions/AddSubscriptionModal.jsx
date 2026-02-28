import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLES } from '../../utils/categories'

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#14b8a6', '#3b82f6',
  '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9',
]

export default function AddSubscriptionModal({ open, onClose, onSave, existing }) {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      billing_cycle: 'monthly',
      status: 'active',
      color: '#6366f1',
      category: 'Entertainment',
    }
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        amount: existing.amount,
        billing_cycle: existing.billing_cycle,
        next_billing_date: existing.next_billing_date || '',
        category: existing.category || 'Entertainment',
        status: existing.status,
        website_url: existing.website_url || '',
        color: existing.color || '#6366f1',
        notes: existing.notes || '',
      })
    } else {
      reset({
        billing_cycle: 'monthly',
        status: 'active',
        color: '#6366f1',
        category: 'Entertainment',
      })
    }
  }, [existing, reset, open])

  const selectedColor = watch('color')

  const onSubmit = async (data) => {
    await onSave({
      name: data.name,
      amount: parseFloat(data.amount),
      billing_cycle: data.billing_cycle,
      next_billing_date: data.next_billing_date || null,
      category: data.category,
      status: data.status,
      website_url: data.website_url || null,
      color: data.color,
      notes: data.notes || null,
    }, existing?.id)
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Subscription' : 'Add Subscription'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Service name *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Netflix"
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
                    ring: selectedColor === c ? '2px solid #374151' : 'none',
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
            {existing ? 'Save Changes' : 'Add Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
