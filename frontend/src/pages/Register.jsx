import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Landmark, AlertCircle, ArrowLeft } from 'lucide-react'
import { authApi } from '../api/auth'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', password: '', full_name: '', email: '',
    phone: '', address: '', account_type: 'Savings',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-2xl">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to login</span>
        </Link>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl gradient-primary text-white">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Join OnlineBank in minutes</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Username</label>
                <input name="username" value={form.username} onChange={handleChange} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" required minLength={4} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Account Type</label>
                <select name="account_type" value={form.account_type} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} className="input-field resize-none" rows={2} required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
