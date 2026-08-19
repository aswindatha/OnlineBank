import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-label-md font-medium text-m3-on-surface-variant hover:text-m3-primary mb-6 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to login
          </button>

          <div className="bg-m3-surface-container-lowest rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-m3-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-m3-error" style={{ fontSize: 24 }}>key</span>
              </div>
              <div>
                <h1 className="text-headline-lg text-m3-on-surface">Forgot Password</h1>
                <p className="text-body-sm text-m3-on-surface-variant">Reset your account password</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded bg-m3-error-container text-m3-on-error-container text-body-sm">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            {tempPassword && (
              <div className="flex items-start gap-3 px-4 py-4 mb-4 rounded bg-m3-primary/5 border border-m3-primary/20">
                <span className="material-symbols-outlined text-m3-primary flex-shrink-0 mt-0.5" style={{ fontSize: 20 }}>check_circle</span>
                <div>
                  <p className="font-semibold text-body-sm text-m3-on-surface">Password reset successful!</p>
                  <p className="text-body-sm text-m3-on-surface-variant mt-1">Your temporary password is:</p>
                  <p className="font-mono font-bold text-lg mt-1 bg-m3-primary/10 text-m3-primary px-3 py-1 rounded inline-block">
                    {tempPassword}
                  </p>
                  <p className="text-label-sm text-m3-on-surface-variant mt-2">Please use this password to log in and change it immediately.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-3 text-label-md font-semibold text-m3-primary hover:text-m3-primary-container transition-colors flex items-center gap-1"
                  >
                    Go to login
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {!tempPassword && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
                <div className="flex flex-col gap-1">
                  <label className="text-label-md font-medium text-m3-on-surface" htmlFor="fp-username">Username</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant" style={{ fontSize: 20 }}>person</span>
                    <input
                      id="fp-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      className="w-full h-12 pl-10 pr-4 rounded border border-m3-outline-variant bg-m3-surface-bright text-m3-on-surface text-body-md focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-md font-medium text-m3-on-surface" htmlFor="fp-email">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant" style={{ fontSize: 20 }}>mail</span>
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded border border-m3-outline-variant bg-m3-surface-bright text-m3-on-surface text-body-md focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/20 transition-all outline-none"
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
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
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
