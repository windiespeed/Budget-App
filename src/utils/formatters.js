import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatCurrency(amount, options = {}) {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    ...options
  }).format(abs)
  return formatted
}

export function formatAmount(amount) {
  // Positive = expense (red), Negative = income (green) — Plaid convention
  const formatted = formatCurrency(Math.abs(amount))
  return amount >= 0 ? `-${formatted}` : `+${formatted}`
}

export function formatDate(dateStr) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'MMM d')
  } catch {
    return dateStr
  }
}

export function formatMonthYear(dateStr) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, 'MMMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return dateStr
  }
}

export function formatPercent(value, total) {
  if (!total || total === 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

export function annualToMonthly(amount, cycle) {
  switch (cycle) {
    case 'weekly': return amount * 52 / 12
    case 'biweekly': return amount * 26 / 12
    case 'monthly': return amount
    case 'quarterly': return amount / 3
    case 'yearly': return amount / 12
    default: return amount
  }
}
