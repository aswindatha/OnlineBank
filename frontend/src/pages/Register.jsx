import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useToast } from '../context/ToastContext'

const formFields = [
  { name: 'username', label: 'Username', icon: 'person', type: 'text', required: true },
  { name: 'password', label: 'Password', icon: 'lock', type: 'password', required: true, minLength: 4 },
  { name: 'full_name', label: 'Full Name', icon: 'badge', type: 'text', required: true },
  { name: 'email', label: 'Email', icon: 'mail', type: 'email', required: true },
  { name: 'phone', label: 'Phone', icon: 'call', type: 'text', required: true },
]

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
    <div className="min-h-screen flex flex-col bg-m3-background text-m3-on-background font-sans">
      {/* Top Nav Bar */}
      <header className="bg-m3-surface border-b border-m3-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <a
            className="flex items-center gap-2 text-headline-md font-bold text-m3-primary"
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/login') }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>account_balance</span>
            OnlineBank
          </a>
          <button
            onClick={() => navigate('/login')}
            className="text-label-md font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-label-md font-medium text-m3-on-surface-variant hover:text-m3-primary mb-6 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to login
          </button>

          <div className="bg-m3-surface-container-lowest rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-m3-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-m3-primary" style={{ fontSize: 24 }}>person_add</span>
              </div>
              <div>
                <h1 className="text-headline-lg text-m3-on-surface">Create Account</h1>
                <p className="text-body-sm text-m3-on-surface-variant">Join OnlineBank in minutes</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded bg-m3-error-container text-m3-on-error-container text-body-sm">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label className="text-label-md font-medium text-m3-on-surface" htmlFor={field.name}>{field.label}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant" style={{ fontSize: 20 }}>{field.icon}</span>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        minLength={field.minLength}
                        className="w-full h-12 pl-10 pr-4 rounded border border-m3-outline-variant bg-m3-surface-bright text-m3-on-surface text-body-md focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <label className="text-label-md font-medium text-m3-on-surface" htmlFor="account_type">Account Type</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant" style={{ fontSize: 20 }}>credit_card</span>
                    <select
                      id="account_type"
                      name="account_type"
                      value={form.account_type}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 rounded border border-m3-outline-variant bg-m3-surface-bright text-m3-on-surface text-body-md focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/20 transition-all outline-none cursor-pointer"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-md font-medium text-m3-on-surface" htmlFor="address">Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-m3-on-surface-variant" style={{ fontSize: 20 }}>home</span>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={2}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded border border-m3-outline-variant bg-m3-surface-bright text-m3-on-surface text-body-md focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/20 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-m3-primary text-m3-on-primary text-label-md font-medium py-3 rounded min-h-[48px] hover:bg-m3-surface-tint transition-colors duration-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-m3-on-primary/30 border-t-m3-on-primary rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-body-sm text-m3-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-m3-primary hover:text-m3-primary-container font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-m3-surface-container-lowest border-t border-m3-outline-variant mt-auto">
        <div className="py-stack-lg px-margin-mobile md:px-margin-desktop w-full flex flex-col md:flex-row justify-between items-center gap-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-m3-on-surface" style={{ fontSize: 20 }}>account_balance</span>
            <span className="text-label-md font-bold text-m3-on-surface">OnlineBank</span>
          </div>
          <p className="text-body-sm text-m3-on-surface-variant text-center md:text-left">
            © 2026 OnlineBank Digital Banking Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
