import { Moon, Sun, Palette, Bell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Card, CardBody, CardHeader, CardTitle, Avatar, Badge } from '../components/ui'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  const colorOptions = ['#4f46e5', '#1a237e', '#1565c0', '#2e7d32', '#6a1b9a', '#e65100', '#00695c', '#ad1457', '#c2185b', '#00838f']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your experience</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={22} className="text-primary-400" /> : <Sun size={22} className="text-amber-500" />}
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark themes</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.full_name} color={user?.avatar_color} size={64} />
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">{user?.full_name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={user?.role === 'admin' ? 'error' : 'info'}>{user?.role}</Badge>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Email</p>
              <p className="text-slate-700 dark:text-slate-200">{user?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Phone</p>
              <p className="text-slate-700 dark:text-slate-200">{user?.phone}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Member Since</p>
              <p className="text-slate-700 dark:text-slate-200">{user?.created_at?.split(' ')[0]}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Last Login</p>
              <p className="text-slate-700 dark:text-slate-200">{user?.last_login?.split(' ')[0] || 'N/A'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold">OnlineBank</span> — Digital Banking Platform</p>
            <p className="text-slate-400">Version 1.0.0</p>
            <p className="text-slate-400">A modern banking portal simulator built with FastAPI & React.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
