import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'

const PAGE_TITLES = {
  '/':              { title: 'Dashboard',     subtitle: 'Your financial overview' },
  '/accounts':      { title: 'Accounts',      subtitle: 'Manage your linked bank accounts' },
  '/transactions':  { title: 'Transactions',  subtitle: 'View and manage your transactions' },
  '/budget':        { title: 'Budget',        subtitle: 'Track spending against your budget' },
  '/subscriptions': { title: 'Subscriptions', subtitle: 'Manage recurring bills & subscriptions' },
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
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">{title}</h1>
          <p className="hidden sm:block text-sm text-gray-500 mt-0.5">{subtitle}</p>
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
