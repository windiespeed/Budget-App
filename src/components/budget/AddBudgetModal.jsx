import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { BUDGET_CATEGORIES } from '../../utils/categories'

export default function AddBudgetModal({ open, onClose, onSave, existing }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    if (existing) {
      reset({ category: existing.category, amount: existing.amount })
    } else {
      reset({ category: 'food_dining', amount: '' })
    }
  }, [existing, reset, open])

  const onSubmit = async (data) => {
    await onSave(data.category, parseFloat(data.amount))
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Budget' : 'Add Budget Category'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={!!existing}
            {...register('category', { required: true })}
          >
            {BUDGET_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly budget *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              step="1"
              min="1"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="500"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 1, message: 'Must be at least $1' }
              })}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            {existing ? 'Save Changes' : 'Add Budget'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
