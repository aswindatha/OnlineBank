import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, User, ArrowDownCircle, ArrowUpCircle,
  Send, Receipt, FileText, Bell, Settings, Shield, LogOut,
  ChevronLeft, Landmark,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/deposit', icon: ArrowDownCircle, label: 'Deposit' },
  { to: '/withdraw', icon: ArrowUpCircle, label: 'Withdraw' },
  { to: '/transfer', icon: Send, label: 'Transfer' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/mini-statement', icon: FileText, label: 'Mini Statement' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
]

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <aside
      className={`gradient-sidebar flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } flex-shrink-0 h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 h-[72px]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 flex-shrink-0">
          <Landmark size={24} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-lg leading-tight">OnlineBank</h1>
            <p className="text-slate-400 text-xs">Digital Banking</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-2 text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft
          size={20}
          className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-white/10" />
            {!collapsed && (
              <p className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Administration
              </p>
            )}
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className={`nav-item w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
