import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  PieChart, Repeat
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Home' },
  { to: '/accounts',      icon: CreditCard,       label: 'Accounts' },
  { to: '/transactions',  icon: ArrowLeftRight,   label: 'Transactions' },
  { to: '/budget',        icon: PieChart,         label: 'Budget' },
  { to: '/subscriptions', icon: Repeat,           label: 'Subscriptions' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
