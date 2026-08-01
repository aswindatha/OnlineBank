import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react'
import { authApi } from '../api/auth'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTempPassword('')
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(username, email)
      setTempPassword(res.data.temp_password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to login</span>
        </Link>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl gradient-warning text-white">
              <KeyRound size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Forgot Password</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reset your account password</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {tempPassword && (
            <div className="flex items-start gap-3 px-4 py-4 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Password reset successful!</p>
                <p className="text-sm mt-1">Your temporary password is:</p>
                <p className="font-mono font-bold text-lg mt-1 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-lg inline-block">
                  {tempPassword}
                </p>
                <p className="text-xs mt-2">Please use this password to log in and change it immediately.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Go to login →
                </button>
              </div>
            </div>
          )}

          {!tempPassword && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
