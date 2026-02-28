import { useState, useMemo } from 'react'
import { Building2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAccounts } from '../hooks/useAccounts'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  )
}

function StatusMessage({ status }) {
  if (!status) return null
  const map = {
    saved:    { color: 'text-emerald-600', msg: 'Saved successfully' },
    updated:  { color: 'text-emerald-600', msg: 'Password updated' },
    saving:   { color: 'text-gray-500',    msg: 'Saving...' },
    mismatch: { color: 'text-red-600',     msg: "Passwords don't match" },
    tooshort: { color: 'text-red-600',     msg: 'Minimum 6 characters' },
    error:    { color: 'text-red-600',     msg: 'Something went wrong' },
  }
  const { color, msg } = map[status] || {}
  return (
    <span className={`text-sm flex items-center gap-1.5 ${color}`}>
      {status === 'saved' || status === 'updated'
        ? <CheckCircle className="w-4 h-4" />
        : <AlertCircle className="w-4 h-4" />}
      {msg}
    </span>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { accounts, loading: acctLoading, fetchAccounts } = useAccounts()

  // Profile
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '')
  const [profileStatus, setProfileStatus] = useState(null)

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwStatus, setPwStatus] = useState(null)

  // Linked banks grouped by institution
  const linkedInstitutions = useMemo(() => {
    const plaidAccounts = accounts.filter(a => !a.is_manual)
    const grouped = {}
    plaidAccounts.forEach(a => {
      const key = a.institution_name || 'Unknown Bank'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(a)
    })
    return Object.entries(grouped)
  }, [accounts])

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileStatus('saving')
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } })
      if (error) throw error
      await supabase.from('profiles').update({ full_name: displayName }).eq('id', user.id)
      setProfileStatus('saved')
      setTimeout(() => setProfileStatus(null), 3000)
    } catch {
      setProfileStatus('error')
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setPwStatus('mismatch'); return }
    if (newPassword.length < 6) { setPwStatus('tooshort'); return }
    setPwStatus('saving')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwStatus('error'); return }
    setNewPassword('')
    setConfirmPassword('')
    setPwStatus('updated')
    setTimeout(() => setPwStatus(null), 3000)
  }

  const disconnectInstitution = async (institutionName) => {
    if (!confirm(`Disconnect ${institutionName}? This will hide all associated accounts.`)) return
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('institution_name', institutionName)
      .eq('is_manual', false)
    if (!error) fetchAccounts()
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Profile */}
      <Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={profileStatus === 'saving'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Save Changes
            </button>
            <StatusMessage status={profileStatus} />
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPwStatus(null) }}
              className={inputClass}
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setPwStatus(null) }}
              className={inputClass}
              placeholder="Repeat new password"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!newPassword || pwStatus === 'saving'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Update Password
            </button>
            <StatusMessage status={pwStatus} />
          </div>
        </form>
      </Section>

      {/* Linked Banks */}
      <Section title="Linked Banks">
        {acctLoading ? (
          <div className="flex justify-center py-6"><LoadingSpinner /></div>
        ) : linkedInstitutions.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No banks linked yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Connect a bank from the Accounts page</p>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedInstitutions.map(([institution, accts]) => (
              <div key={institution} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{institution}</p>
                    <p className="text-xs text-gray-500">
                      {accts.length} account{accts.length !== 1 ? 's' : ''} · {accts.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => disconnectInstitution(institution)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex-shrink-0 ml-3"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

    </div>
  )
}
