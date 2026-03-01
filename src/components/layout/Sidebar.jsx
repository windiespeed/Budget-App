import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  PieChart, Repeat, LogOut, Scale, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Home' },
  { to: '/accounts',      icon: CreditCard,       label: 'Accounts' },
  { to: '/transactions',  icon: ArrowLeftRight,   label: 'Transactions' },
  { to: '/budget',        icon: PieChart,         label: 'Budget' },
  { to: '/subscriptions', icon: Repeat,           label: 'Expenses' },
  { to: '/reconcile',     icon: Scale,            label: 'Reconcile' },
]

export default function Sidebar({ onClose, collapsed, onToggle }) {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-full flex-shrink-0 bg-slate-900 flex flex-col h-full overflow-hidden">
      {/* Collapse button — visible only when expanded */}
      {!collapsed && onToggle && (
        <div className="flex justify-end px-2 pt-3 pb-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-4 space-y-0.5 overflow-y-auto overflow-x-hidden`}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon className="flex-shrink-0" size={18} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} py-4 border-t border-slate-800`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/settings"
              className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center hover:ring-2 hover:ring-indigo-400 transition-all"
              title={user?.user_metadata?.full_name || user?.email || 'Settings'}
            >
              <span className="text-white text-xs font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </Link>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 hover:bg-slate-800 transition-colors"
            >
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
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
