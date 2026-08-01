import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { notifApi } from '../api/notifications'
import { Avatar } from './ui/Avatar'

export function TopBar({ onToggleSidebar }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [clock, setClock] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const options = {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true,
      }
      setClock(now.toLocaleString('en-US', options))
    }
    updateClock()
    intervalRef.current = setInterval(updateClock, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!user) return
    notifApi.getUnreadCount().then((res) => setUnreadCount(res.data.count)).catch(() => {})
    const poll = setInterval(() => {
      notifApi.getUnreadCount().then((res) => setUnreadCount(res.data.count)).catch(() => {})
    }, 30000)
    return () => clearInterval(poll)
  }, [user])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/transactions')
      }
      // Pass search query via state
      window.dispatchEvent(new CustomEvent('global-search', { detail: searchQuery }))
    }
  }

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 flex items-center px-6 gap-4">
      {/* Menu toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Menu size={20} className="text-slate-600 dark:text-slate-300" />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-400 focus:outline-none text-sm text-slate-700 dark:text-slate-200 transition-all"
          />
        </div>
      </form>

      <div className="flex-1" />

      {/* Clock */}
      <span className="hidden lg:block text-sm text-slate-500 dark:text-slate-400 font-medium tabular-nums">
        {clock}
      </span>

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {theme === 'dark' ? (
          <Sun size={20} className="text-slate-300" />
        ) : (
          <Moon size={20} className="text-slate-600" />
        )}
      </button>

      {/* Profile */}
      <div className="flex items-center gap-3 pl-2">
        <Avatar name={user?.full_name} color={user?.avatar_color} size={40} />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
            {user?.full_name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  )
}
