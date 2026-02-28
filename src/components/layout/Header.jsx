import { Link, useLocation } from 'react-router-dom'
import { Bell, Menu, DollarSign } from 'lucide-react'

const PAGE_TITLES = {
  '/':              { title: 'Home',          subtitle: 'Welcome back' },
  '/accounts':      { title: 'Accounts',      subtitle: 'Manage your linked bank accounts' },
  '/transactions':  { title: 'Transactions',  subtitle: 'View and manage your transactions' },
  '/budget':        { title: 'Budget',        subtitle: 'Track spending against your budget' },
  '/subscriptions': { title: 'Subscriptions', subtitle: 'Manage recurring bills & subscriptions' },
  '/settings':      { title: 'Settings',      subtitle: 'Manage your account and preferences' },
  '/reconcile':     { title: 'Reconcile',     subtitle: 'Match transactions to your bank statement' },
}

export default function Header({ onMenuOpen }) {
  const { pathname } = useLocation()
  const { title, subtitle } = PAGE_TITLES[pathname] || PAGE_TITLES['/']

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base">BudgetWise</span>
        </Link>
        <div className="w-px h-5 bg-gray-200 hidden sm:block" />
        <div className="hidden sm:block">
          <h1 className="text-base font-semibold text-gray-700">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
