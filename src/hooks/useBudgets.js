import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useBudgets(month, year) {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [spending, setSpending] = useState({}) // { category: totalSpent }
  const [loading, setLoading] = useState(true)

  const currentMonth = month || new Date().getMonth() + 1
  const currentYear = year || new Date().getFullYear()

  const fetchBudgets = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Fetch budgets for this month
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)

    // Fetch transactions for this month to compute spending per category
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    const { data: txnData } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .gt('amount', 0) // Only expenses (positive = expense in Plaid convention)

    // Compute spending per category
    const spendingMap = {}
    ;(txnData || []).forEach(t => {
      spendingMap[t.category] = (spendingMap[t.category] || 0) + t.amount
    })

    setBudgets(budgetData || [])
    setSpending(spendingMap)
    setLoading(false)
  }, [user, currentMonth, currentYear])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  const upsertBudget = async (category, amount) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { user_id: user.id, category, amount, month: currentMonth, year: currentYear },
        { onConflict: 'user_id,category,month,year' }
      )
      .select()
      .single()
    if (error) throw error
    setBudgets(prev => {
      const existing = prev.findIndex(b => b.category === category)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = data
        return updated
      }
      return [...prev, data]
    })
    return data
  }

  const deleteBudget = async (id) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  // Enrich budgets with spending data
  const budgetsWithSpending = budgets.map(b => ({
    ...b,
    spent: spending[b.category] || 0,
    remaining: b.amount - (spending[b.category] || 0),
    percentUsed: b.amount > 0 ? Math.min(100, Math.round(((spending[b.category] || 0) / b.amount) * 100)) : 0,
  }))

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = Object.values(spending).reduce((sum, v) => sum + v, 0)

  return {
    budgets: budgetsWithSpending, loading, spending,
    fetchBudgets, upsertBudget, deleteBudget,
    totalBudgeted, totalSpent,
    month: currentMonth, year: currentYear
  }
}
