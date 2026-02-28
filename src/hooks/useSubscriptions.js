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

  const totalMonthly = active.reduce((sum, s) => {
    return sum + annualToMonthly(s.amount, s.billing_cycle)
  }, 0)

  const totalAnnual = totalMonthly * 12

  // Subscriptions due in the next 7 days
  const upcoming = active
    .filter(s => {
      if (!s.next_billing_date) return false
      const days = (new Date(s.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24)
      return days >= 0 && days <= 7
    })
    .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))

  return {
    subscriptions, loading, error,
    fetchSubscriptions, addSubscription, updateSubscription, deleteSubscription,
    totalMonthly, totalAnnual, upcoming, activeCount: active.length
  }
}
