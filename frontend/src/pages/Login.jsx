import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Landmark, Lock, User as UserIcon, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      toast.success(`Welcome back, ${user.full_name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur">
              <Landmark size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">OnlineBank</h1>
              <p className="text-white/70 text-sm">Digital Banking Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Banking reimagined<br />for the digital age
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-md">
            Manage your finances, transfer funds, track transactions, and stay in control — all from one beautiful dashboard.
          </p>
          <div className="space-y-3">
            {['Instant deposits & withdrawals', 'Secure fund transfers', 'Real-time notifications', 'Detailed transaction history'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl gradient-primary text-white">
              <Landmark size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">OnlineBank</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Username</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field pl-11"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Forgot password?
            </Link>
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Create account
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: <span className="font-mono">admin / admin123</span></p>
            <p>User: <span className="font-mono">john_doe / password123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
