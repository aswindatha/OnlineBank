import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const tabContent = {
  Personal: {
    badge: 'Personal Banking',
    badgeIcon: 'person',
    headline: 'Banking reimagined\nfor the digital age',
    description: 'Manage your finances, transfer funds, track transactions, and stay in control — all from one beautiful dashboard.',
    features: [
      { icon: 'savings', title: 'Instant Transactions', text: 'Instant deposits & 24/7 fast withdrawals' },
      { icon: 'security', title: 'Bank-Grade Security', text: 'Multi-layer encrypted fund transfers' },
      { icon: 'notifications_active', title: 'Real-time Alerts', text: 'Instant push & email transaction notifications' },
      { icon: 'history', title: 'Smart Analytics', text: 'Detailed transaction history & spending insights' },
    ],
  },
  Business: {
    badge: 'Business Solutions',
    badgeIcon: 'business_center',
    headline: 'Business banking\nbuilt for growth',
    description: 'Streamline payroll, manage vendor payments, and track cash flow with powerful tools designed for modern businesses.',
    features: [
      { icon: 'payments', title: 'Vendor Payments', text: 'Automated bulk transfers & recurring payouts' },
      { icon: 'group', title: 'Team Access', text: 'Role-based multi-user permissions & controls' },
      { icon: 'analytics', title: 'Cash Flow Insights', text: 'Real-time financial analytics & forecasts' },
      { icon: 'receipt_long', title: 'Invoicing Tools', text: 'Automated digital invoicing & receipt generation' },
    ],
  },
  Wealth: {
    badge: 'Wealth Management',
    badgeIcon: 'diamond',
    headline: 'Wealth management\nredefined',
    description: 'Track investments, monitor portfolios, and get personalized advisory — premium banking for your financial future.',
    features: [
      { icon: 'trending_up', title: 'Portfolio Tracking', text: 'Real-time investment & asset monitoring' },
      { icon: 'diamond', title: 'Private Advisory', text: 'Tailored investment strategy & market guidance' },
      { icon: 'support_agent', title: 'Dedicated Manager', text: '1-on-1 priority wealth management expert' },
      { icon: 'lock', title: 'Asset Protection', text: 'Institutional-grade security & fraud protection' },
    ],
  },
}

const helpItems = [
  { icon: 'phone', title: 'Call Us', detail: '1800-123-4567', sub: 'Mon–Sat, 9 AM – 7 PM IST' },
  { icon: 'mail', title: 'Email', detail: 'support@onlinebank.com', sub: 'We reply within 24 hours' },
  { icon: 'chat', title: 'Live Chat', detail: 'Available in-app', sub: 'After you sign in' },
  { icon: 'location_on', title: 'Branch Locator', detail: 'Find nearest branch', sub: '100+ branches nationwide' },
]

const footerLinks = [
  { label: 'Privacy Policy', icon: 'privacy_tip' },
  { label: 'Terms of Service', icon: 'description' },
  { label: 'Security', icon: 'shield' },
  { label: 'Contact Us', icon: 'contact_support' },
]

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Personal')
  const [showHelp, setShowHelp] = useState(false)
  const [showFooterModal, setShowFooterModal] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      toast.success(`Welcome back, ${user.full_name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const content = tabContent[activeTab]

  return (
    <div className="min-h-screen flex flex-col bg-m3-background text-m3-on-background font-sans selection:bg-m3-primary selection:text-white">
      {/* Top Nav Bar */}
      <header className="bg-m3-surface/90 backdrop-blur-md border-b border-m3-outline-variant/60 sticky top-0 z-50">
        <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a
              className="flex items-center gap-2.5 text-headline-md font-bold text-m3-primary hover:opacity-90 transition-opacity"
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >
              <div className="w-9 h-9 rounded-xl bg-m3-primary/10 flex items-center justify-center text-m3-primary">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>account_balance</span>
              </div>
              <span className="tracking-tight">OnlineBank</span>
            </a>
            <nav className="hidden md:flex gap-1 items-center bg-m3-surface-container-low/80 p-1 rounded-xl border border-m3-outline-variant/40">
              {Object.keys(tabContent).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-label-md font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-m3-primary text-white shadow-sm'
                      : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button
                onClick={() => setShowHelp(true)}
                className={`text-label-md font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === 'Help'
                    ? 'bg-m3-primary text-white shadow-sm'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
                }`}
              >
                Help
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToForm}
              className="hidden md:block text-label-md font-medium text-m3-on-surface-variant hover:text-m3-primary px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-m3-primary hover:bg-m3-surface-tint text-m3-on-primary text-label-md font-semibold px-5 py-2 rounded-xl transition-all shadow-md shadow-m3-primary/20 active:scale-95 flex items-center gap-1.5"
            >
              Create account
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex flex-col md:flex-row w-full bg-m3-surface-container-lowest">
        {/* Left Side: Marketing Hero */}
        <section className="w-full md:w-1/2 bg-gradient-to-br from-[#201f8d] via-[#3534bd] to-[#4544d6] text-white flex flex-col justify-center py-12 md:py-16 px-6 md:px-12 lg:px-16 xl:px-20 relative overflow-hidden min-h-[480px] md:min-h-0 border-r border-white/10">
          {/* Subtle Ambient Background Decorative Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto z-10">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{content.badgeIcon}</span>
              {content.badge}
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 leading-[1.15] whitespace-pre-line text-white">
              {content.headline}
            </h1>
            
            <p className="text-base lg:text-lg text-white/90 mb-8 leading-relaxed max-w-2xl">
              {content.description}
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {content.features.map((f) => (
                <div 
                  key={f.title} 
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white mt-0.5 shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{f.title}</h3>
                    <p className="text-xs text-white/80 mt-0.5 leading-relaxed">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Trust Badge */}
            <div className="pt-5 border-t border-white/15 flex flex-wrap items-center gap-5 text-xs text-white/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-300" style={{ fontSize: 16 }}>verified_user</span>
                256-Bit Encryption
              </div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-300" style={{ fontSize: 16 }}>bolt</span>
                99.99% Uptime
              </div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-300" style={{ fontSize: 16 }}>star</span>
                Rated #1 Banking App
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full md:w-1/2 bg-m3-surface-container-lowest flex items-center justify-center py-12 md:py-16 px-6 md:px-10 lg:px-14 xl:px-16">
          <div className="w-full max-w-md lg:max-w-lg mx-auto" ref={formRef}>
            <div className="bg-m3-surface-bright/80 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-3xl border border-m3-outline-variant/40 shadow-xl shadow-m3-primary/5 flex flex-col gap-6">
              {/* Mobile Branding */}
              <div className="flex md:hidden items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-m3-primary/10 flex items-center justify-center text-m3-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>account_balance</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-m3-primary">OnlineBank</h2>
                  <p className="text-xs text-m3-on-surface-variant">Digital Banking Platform</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-m3-on-surface tracking-tight">Welcome Back</h2>
                <p className="text-sm text-m3-on-surface-variant mt-1">Sign in to your account to manage your finances</p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-m3-error-container text-m3-on-error-container text-sm shadow-sm">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 20 }}>error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-m3-on-surface-variant" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-on-surface-variant pointer-events-none" style={{ fontSize: 20 }}>person</span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-m3-outline-variant/70 bg-m3-surface text-m3-on-surface text-sm focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/15 transition-all outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-m3-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-on-surface-variant pointer-events-none" style={{ fontSize: 20 }}>lock</span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-m3-outline-variant/70 bg-m3-surface text-m3-on-surface text-sm focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/15 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-m3-primary hover:bg-m3-surface-tint text-m3-on-primary text-sm font-semibold py-3.5 rounded-xl min-h-[48px] transition-all duration-200 shadow-md shadow-m3-primary/25 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-m3-on-primary/30 border-t-m3-on-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs font-medium pt-1">
                  <Link to="/forgot-password" className="text-m3-primary hover:underline transition-colors">
                    Forgot password?
                  </Link>
                  <Link to="/register" className="text-m3-primary hover:underline transition-colors">
                    Create account
                  </Link>
                </div>
              </form>

              {/* Demo Credentials Card */}
              <div className="p-4 bg-m3-surface-container-low/80 rounded-2xl border border-m3-outline-variant/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-m3-primary" style={{ fontSize: 18 }}>badge</span>
                  <p className="text-xs font-bold text-m3-on-surface tracking-wide uppercase">Demo Credentials</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-m3-surface border border-m3-outline-variant/30">
                    <p className="text-m3-on-surface-variant text-[10px] font-sans font-semibold uppercase">Admin Account</p>
                    <p className="text-m3-on-surface font-semibold mt-0.5">admin / admin123</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-m3-surface border border-m3-outline-variant/30">
                    <p className="text-m3-on-surface-variant text-[10px] font-sans font-semibold uppercase">Standard User</p>
                    <p className="text-m3-on-surface font-semibold mt-0.5">john_doe / password123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-m3-surface-container-lowest border-t border-m3-outline-variant/60 mt-auto">
        <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-m3-primary" style={{ fontSize: 20 }}>account_balance</span>
            <span className="text-sm font-bold text-m3-on-surface">OnlineBank</span>
          </div>
          <p className="text-xs text-m3-on-surface-variant text-center md:text-left">
            © 2026 OnlineBank Digital Banking Platform. All rights reserved.
          </p>
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => setShowFooterModal(link.label)}
                className="text-xs font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowHelp(false)}>
          <div className="bg-m3-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-m3-outline-variant/40" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-m3-primary/10 flex items-center justify-center text-m3-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>help</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-m3-on-surface">How can we help?</h3>
                  <p className="text-xs text-m3-on-surface-variant">Customer support & quick assistance</p>
                </div>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-2 rounded-xl hover:bg-m3-surface-container text-m3-on-surface-variant transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {helpItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/40">
                  <span className="material-symbols-outlined text-m3-primary mt-0.5" style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-m3-on-surface">{item.title}</p>
                    <p className="text-xs text-m3-primary font-semibold mt-0.5">{item.detail}</p>
                    <p className="text-[11px] text-m3-on-surface-variant mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3.5 rounded-xl bg-m3-primary/5 border border-m3-primary/20 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-m3-primary flex-shrink-0 mt-0.5" style={{ fontSize: 18 }}>security</span>
              <p className="text-xs text-m3-on-surface-variant leading-relaxed">
                Need to report a lost card or suspicious activity? Call our 24/7 emergency line at <span className="font-bold text-m3-primary">1800-123-4567</span> immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Link Modal */}
      {showFooterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setShowFooterModal(null)}>
          <div className="bg-m3-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full p-6 border border-m3-outline-variant/40" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-m3-on-surface">{showFooterModal}</h3>
              <button onClick={() => setShowFooterModal(null)} className="p-2 rounded-xl hover:bg-m3-surface-container text-m3-on-surface-variant transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <p className="text-sm text-m3-on-surface-variant leading-relaxed">
              This is a demo banking application. The {showFooterModal} page would contain full legal and policy content in a production environment.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 flex items-center gap-2 text-xs text-m3-on-surface-variant">
              <span className="material-symbols-outlined text-m3-primary" style={{ fontSize: 18 }}>info</span>
              For questions, contact support@onlinebank.com
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

