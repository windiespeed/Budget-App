import { useState, useEffect, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Link2, Loader2, Check, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

// step: 'idle' | 'fetching' | 'ready' | 'exchanging' | 'success' | 'error'

export default function PlaidLinkButton({ onSuccess }) {
  const { user } = useAuth()
  const [linkToken, setLinkToken] = useState(null)
  const [step, setStep] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState(null)

  // --- Plaid Link handlers ---
  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    setStep('exchanging')
    const { data, error } = await supabase.functions.invoke('plaid-exchange', {
      body: {
        public_token: publicToken,
        institution_id: metadata.institution?.institution_id ?? null,
        institution_name: metadata.institution?.name ?? 'Bank',
        user_id: user.id,
      },
    })
    if (error || data?.error) {
      setErrorMsg(data?.error || error?.message || 'Failed to sync bank data.')
      setStep('error')
      return
    }
    setResult(data)
    setStep('success')
    if (onSuccess) onSuccess(data)
  }, [user, onSuccess])

  const onPlaidExit = useCallback((err) => {
    if (err) {
      setErrorMsg(err.display_message || err.error_message || 'Bank connection was cancelled.')
      setStep('error')
    } else {
      // User closed Plaid Link without connecting — reset silently
      setStep('idle')
      setLinkToken(null)
    }
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  })

  // Open Plaid Link as soon as the token is ready
  useEffect(() => {
    if (step === 'ready' && ready && linkToken) {
      open()
    }
  }, [step, ready, linkToken, open])

  // --- Main button click: fetch link token from Edge Function ---
  const handleClick = async () => {
    setStep('fetching')
    setErrorMsg('')
    const { data, error } = await supabase.functions.invoke('plaid-link-token', {
      body: { user_id: user.id },
    })
    if (error || data?.error) {
      setErrorMsg(data?.error || error?.message || 'Could not start bank connection.')
      setStep('error')
      return
    }
    setLinkToken(data.link_token)
    setStep('ready')
    // useEffect above will call open() once `ready` is true
  }

  const reset = () => {
    setStep('idle')
    setLinkToken(null)
    setErrorMsg('')
    setResult(null)
  }

  // --- Status overlay (shown during fetching / exchanging / success / error) ---
  const showOverlay = step !== 'idle' && step !== 'ready'

  return (
    <>
      <button
        onClick={handleClick}
        disabled={step === 'fetching' || step === 'ready' || step === 'exchanging'}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
      >
        {step === 'fetching' || step === 'ready'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Link2 className="w-4 h-4" />
        }
        {step === 'fetching' || step === 'ready' ? 'Opening Plaid...' : 'Connect Bank'}
      </button>

      {/* Status overlay modal */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === 'success' || step === 'error' ? reset : undefined} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">

            {/* Syncing */}
            {step === 'exchanging' && (
              <>
                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Syncing your bank...</h3>
                <p className="text-sm text-gray-500">Importing accounts and transactions. This takes a few seconds.</p>
              </>
            )}

            {/* Success */}
            {step === 'success' && (
              <>
                <button onClick={reset} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Connected!</h3>
                <p className="text-sm text-gray-500 mb-1">Your bank accounts have been linked.</p>
                {result && (
                  <p className="text-xs text-gray-400 mb-5">
                    {result.accounts?.length ?? 0} accounts &bull; {result.transactionCount ?? 0} transactions synced
                  </p>
                )}
                <button
                  onClick={reset}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Done
                </button>
              </>
            )}

            {/* Error */}
            {step === 'error' && (
              <>
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection failed</h3>
                <p className="text-sm text-red-600 mb-5">{errorMsg || 'Something went wrong. Please try again.'}</p>
                <button
                  onClick={reset}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
