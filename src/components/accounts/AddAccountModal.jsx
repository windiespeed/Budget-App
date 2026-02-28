import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { ACCOUNT_TYPES } from '../../utils/categories'

export default function AddAccountModal({ open, onClose, onAdd }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { account_type: 'checking', balance: '' }
  })

  const onSubmit = async (data) => {
    await onAdd({
      name: data.name,
      institution_name: data.institution_name || null,
      account_type: data.account_type,
      balance: parseFloat(data.balance) || 0,
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account name *</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Chase Checking"
            {...register('name', { required: 'Account name is required' })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Chase Bank"
            {...register('institution_name')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account type *</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            {...register('account_type', { required: true })}
          >
            {ACCOUNT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current balance</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
              {...register('balance')}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Add Account
          </button>
        </div>
      </form>
    </Modal>
  )
}
