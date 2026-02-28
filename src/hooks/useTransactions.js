import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTransactions(filters = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.category) query = query.eq('category', filters.category)
    if (filters.accountId) query = query.eq('account_id', filters.accountId)
    if (filters.startDate) query = query.gte('transaction_date', filters.startDate)
    if (filters.endDate) query = query.lte('transaction_date', filters.endDate)
    if (filters.search) query = query.ilike('description', `%${filters.search}%`)
    if (filters.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) setError(error.message)
    else setTransactions(data || [])
    setLoading(false)
  }, [user, filters.category, filters.accountId, filters.startDate, filters.endDate, filters.search, filters.limit])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const addTransaction = async (txnData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...txnData, user_id: user.id, is_manual: true })
      .select()
      .single()
    if (error) throw error
    setTransactions(prev => [data, ...prev])
    return data
  }

  const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  // Spending = sum of positive amounts (expenses) for the given transactions
  const totalSpending = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    transactions, loading, error,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction,
    totalSpending, totalIncome
  }
}
