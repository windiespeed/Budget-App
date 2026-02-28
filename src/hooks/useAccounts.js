import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useAccounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAccounts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setAccounts(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const addAccount = async (accountData) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...accountData, user_id: user.id, is_manual: true })
      .select()
      .single()
    if (error) throw error
    setAccounts(prev => [data, ...prev])
    return data
  }

  const updateAccount = async (id, updates) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setAccounts(prev => prev.map(a => a.id === id ? data : a))
    return data
  }

  const deleteAccount = async (id) => {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  const totalBalance = accounts.reduce((sum, a) => {
    return sum + (a.account_type === 'credit' ? -Math.abs(a.balance) : a.balance)
  }, 0)

  return { accounts, loading, error, fetchAccounts, addAccount, updateAccount, deleteAccount, totalBalance }
}
