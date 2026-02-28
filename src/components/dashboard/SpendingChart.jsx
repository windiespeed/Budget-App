import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatDateShort, formatCurrency } from '../../utils/formatters'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name === 'spending' ? '↑ Spent' : '↓ Income'}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function SpendingChart({ transactions }) {
  const data = useMemo(() => {
    if (!transactions?.length) return []

    // Build daily aggregates for the last 30 days
    const now = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }

    const byDate = {}
    transactions.forEach(t => {
      const key = t.transaction_date
      if (!byDate[key]) byDate[key] = { spending: 0, income: 0 }
      if (t.amount > 0) byDate[key].spending += t.amount
      else byDate[key].income += Math.abs(t.amount)
    })

    return days.map(d => ({
      date: formatDateShort(d),
      spending: parseFloat((byDate[d]?.spending || 0).toFixed(2)),
      income: parseFloat((byDate[d]?.income || 0).toFixed(2)),
    }))
  }, [transactions])

  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
      No transaction data yet
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={2} fill="url(#spendGrad)" name="spending" dot={false} />
        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="income" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
