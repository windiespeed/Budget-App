import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  PieChart, Repeat, DollarSign, LogOut, X, Settings
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts',      icon: CreditCard,       label: 'Accounts' },
  { to: '/transactions',  icon: ArrowLeftRight,   label: 'Transactions' },
  { to: '/budget',        icon: PieChart,         label: 'Budget' },
  { to: '/subscriptions', icon: Repeat,           label: 'Subscriptions' },
  { to: '/settings',      icon: Settings,         label: 'Settings' },
]

export default function Sidebar({ onClose }) {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-full flex-shrink-0 bg-slate-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">BudgetWise</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
