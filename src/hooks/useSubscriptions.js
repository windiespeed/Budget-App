import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { annualToMonthly } from '../utils/formatters'

export function useSubscriptions() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setSubscriptions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchSubscriptions() }, [fetchSubscriptions])

  const addSubscription = async (subData) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ ...subData, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setSubscriptions(prev => [data, ...prev])
    return data
  }

  const updateSubscription = async (id, updates) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setSubscriptions(prev => prev.map(s => s.id === id ? data : s))
    return data
  }

  const deleteSubscription = async (id) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  const active = subscriptions.filter(s => s.status === 'active')
  const activeExpenses = active.filter(s => s.entry_type !== 'income')
  const activeIncome = active.filter(s => s.entry_type === 'income')

  const totalMonthly = activeExpenses.reduce((sum, s) => sum + annualToMonthly(s.amount, s.billing_cycle), 0)
  const totalMonthlyIncome = activeIncome.reduce((sum, s) => sum + annualToMonthly(s.amount, s.billing_cycle), 0)
  const totalAnnual = totalMonthly * 12

  // Bills/subscriptions due in the next 7 days
  const upcoming = activeExpenses
    .filter(s => {
      if (!s.next_billing_date) return false
      const days = (new Date(s.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24)
      return days >= 0 && days <= 7
    })
    .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))

  return {
    subscriptions, loading, error,
    fetchSubscriptions, addSubscription, updateSubscription, deleteSubscription,
    totalMonthly, totalMonthlyIncome, totalAnnual, upcoming, activeCount: active.length
  }
}

// Returns a map of accountId → { billsDue, incomeExpected } for active entries due within 30 days
export function computeAccountBalances(subscriptions, accounts) {
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)
  const map = {}
  for (const a of accounts) map[a.id] = { billsDue: 0, incomeExpected: 0 }

  for (const s of subscriptions) {
    if (s.status !== 'active' || !s.account_id || !map[s.account_id]) continue
    const due = s.next_billing_date ? new Date(s.next_billing_date) : null
    if (due && due > in30) continue
    const monthly = annualToMonthly(s.amount, s.billing_cycle)
    if (s.entry_type === 'income') map[s.account_id].incomeExpected += monthly
    else map[s.account_id].billsDue += monthly
  }
  return map
}
