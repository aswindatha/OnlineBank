import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, TrendingUp, TrendingDown, ArrowRightLeft, Hash,
  ArrowDownCircle, ArrowUpCircle, Send, Receipt,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { accountApi } from '../api/account'
import { txApi } from '../api/transactions'
import { StatCard, Card, CardBody, CardHeader, CardTitle, Badge, Spinner, EmptyState } from '../components/ui'

const formatCurrency = (amt) => `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (dt) => {
  if (!dt) return 'N/A'
  try {
    return new Date(dt).toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  } catch { return dt }
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState({})
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      accountApi.getAccount(),
      txApi.getStats(),
      txApi.getMonthlyActivity(6),
      txApi.getMiniStatement(5),
    ]).then(([accRes, statsRes, monthlyRes, txRes]) => {
      setAccount(accRes.data)
      setStats(statsRes.data)
      setMonthly(monthlyRes.data)
      setRecentTx(txRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={40} />
      </div>
    )
  }

  const chartData = Object.entries(monthly).map(([month, data]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Deposit: data.Deposit || 0,
    Withdraw: data.Withdraw || 0,
    Transfer: data.Transfer || 0,
  }))

  const quickActions = [
    { label: 'Deposit', icon: ArrowDownCircle, route: '/deposit', gradient: 'gradient-success' },
    { label: 'Withdraw', icon: ArrowUpCircle, route: '/withdraw', gradient: 'gradient-warning' },
    { label: 'Transfer', icon: Send, route: '/transfer', gradient: 'gradient-primary' },
    { label: 'History', icon: Receipt, route: '/transactions', gradient: 'gradient-error' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.full_name}</p>
      </div>

      {/* Balance card + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="gradient-hero rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet size={20} />
                  <span className="text-sm font-medium text-white/80">Total Balance</span>
                </div>
                <Badge variant="success" className="bg-white/20 text-white">{account?.status || 'Active'}</Badge>
              </div>
              <h2 className="text-4xl font-bold mb-2">{formatCurrency(account?.balance || 0)}</h2>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Account Number</p>
                  <p className="font-mono font-semibold">{account?.account_number}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Type</p>
                  <p className="font-semibold">{account?.account_type}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Branch</p>
                  <p className="font-semibold">{account?.branch}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">IFSC Code</p>
                  <p className="font-mono font-semibold">{account?.ifsc}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Last Login</p>
                  <p className="font-semibold text-sm">{user?.last_login ? new Date(user.last_login).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.route)}
              className="glass-card-hover p-4 flex flex-col items-center justify-center gap-2 group"
            >
              <div className={`p-3 rounded-xl ${action.gradient} text-white group-hover:scale-110 transition-transform`}>
                <action.icon size={24} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Deposits" value={formatCurrency(stats?.total_deposit || 0)} icon={TrendingUp} gradient="gradient-success" />
        <StatCard label="Total Withdrawals" value={formatCurrency(stats?.total_withdraw || 0)} icon={TrendingDown} gradient="gradient-warning" />
        <StatCard label="Total Transfers" value={formatCurrency(stats?.total_transfer || 0)} icon={ArrowRightLeft} gradient="gradient-primary" />
        <StatCard label="Transactions" value={stats?.count || 0} icon={Hash} gradient="gradient-error" />
      </div>

      {/* Chart + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
            </CardHeader>
            <CardBody>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="Deposit" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Withdraw" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Transfer" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No activity yet" message="Your transaction history will appear here." />
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <button onClick={() => navigate('/transactions')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  View all
                </button>
              </div>
            </CardHeader>
            <CardBody>
              {recentTx.length > 0 ? (
                <div className="space-y-3">
                  {recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'Deposit' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        tx.type === 'Withdraw' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      }`}>
                        {tx.type === 'Deposit' ? <TrendingUp size={16} /> : tx.type === 'Withdraw' ? <TrendingDown size={16} /> : <ArrowRightLeft size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{tx.description}</p>
                        <p className="text-xs text-slate-400">{formatDate(tx.created_at)}</p>
                      </div>
                      <span className={`text-sm font-semibold ${tx.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {tx.type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No transactions" message="Your recent transactions will appear here." />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
