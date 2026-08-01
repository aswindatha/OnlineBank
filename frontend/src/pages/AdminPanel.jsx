import { useState, useEffect } from 'react'
import {
  Users, TrendingUp, TrendingDown, ArrowRightLeft, Wallet,
  Receipt, Search, UserPlus, Trash2, Power, Edit, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { adminApi } from '../api/admin'
import { useToast } from '../context/ToastContext'
import {
  Card, CardBody, CardHeader, CardTitle, StatCard, Button,
  Badge, Modal, Avatar, Spinner, EmptyState,
} from '../components/ui'

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

export default function AdminPanel() {
  const toast = useToast()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [txType, setTxType] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(null)
  const [addForm, setAddForm] = useState({
    username: '', password: '', full_name: '', email: '',
    phone: '', address: '', account_type: 'Savings', initial_balance: 0,
  })
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', address: '' })

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      setSearch(e.detail)
      setTab('transactions')
    }
    window.addEventListener('global-search', handler)
    return () => window.removeEventListener('global-search', handler)
  }, [])

  useEffect(() => {
    if (tab === 'users' && users.length === 0) loadUsers()
    if (tab === 'transactions' && transactions.length === 0) loadTransactions()
  }, [tab])

  const loadDashboard = async () => {
    try {
      const [statsRes, monthlyRes, activityRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getMonthlyActivity(6),
        adminApi.getRecentActivity(10),
      ])
      setStats(statsRes.data)
      setMonthly(monthlyRes.data)
      setRecentActivity(activityRes.data)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsers()
      setUsers(res.data)
    } catch {
      toast.error('Failed to load users')
    }
  }

  const loadTransactions = async () => {
    try {
      const res = await adminApi.getTransactions({ tx_type: txType, search: search || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined })
      setTransactions(res.data)
    } catch {
      toast.error('Failed to load transactions')
    }
  }

  useEffect(() => {
    if (tab === 'transactions') loadTransactions()
  }, [txType, search, dateFrom, dateTo])

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await adminApi.addUser(addForm)
      toast.success('User added successfully')
      setShowAddUser(false)
      setAddForm({ username: '', password: '', full_name: '', email: '', phone: '', address: '', account_type: 'Savings', initial_balance: 0 })
      loadUsers()
      loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add user')
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      await adminApi.updateUser(showEditUser.id, editForm)
      toast.success('User updated successfully')
      setShowEditUser(null)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return
    try {
      await adminApi.deleteUser(id)
      toast.success('User deleted')
      loadUsers()
      loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  const handleToggleStatus = async (id, currentActive) => {
    try {
      await adminApi.toggleStatus(id, !currentActive)
      toast.success(`User ${!currentActive ? 'activated' : 'deactivated'}`)
      loadUsers()
    } catch (err) {
      toast.error('Failed to toggle status')
    }
  }

  const openEdit = (user) => {
    setEditForm({ full_name: user.full_name, email: user.email, phone: user.phone, address: user.address || '' })
    setShowEditUser(user)
  }

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

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Users' },
    { key: 'transactions', label: 'Transactions' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">System administration and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats?.total_users || 0} icon={Users} gradient="gradient-primary" subtitle={`${stats?.active_users || 0} active`} />
            <StatCard label="Total Balance" value={formatCurrency(stats?.total_balance || 0)} icon={Wallet} gradient="gradient-success" />
            <StatCard label="Total Transactions" value={stats?.total_transactions || 0} icon={Receipt} gradient="gradient-error" />
            <StatCard label="Total Deposits" value={formatCurrency(stats?.total_deposits || 0)} icon={TrendingUp} gradient="gradient-success" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Withdrawals" value={formatCurrency(stats?.total_withdrawals || 0)} icon={TrendingDown} gradient="gradient-warning" />
            <StatCard label="Total Transfers" value={formatCurrency(stats?.total_transfers || 0)} icon={ArrowRightLeft} gradient="gradient-primary" />
          </div>

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
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Bar dataKey="Deposit" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Withdraw" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Transfer" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No activity data" />
                  )}
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle><Activity size={18} className="inline mr-2" />Recent Activity</CardTitle>
              </CardHeader>
              <CardBody>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {recentActivity.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-3 py-2">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'Deposit' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                          tx.type === 'Withdraw' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                        }`}>
                          {tx.type === 'Deposit' ? <TrendingUp size={14} /> : tx.type === 'Withdraw' ? <TrendingDown size={14} /> : <ArrowRightLeft size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{tx.full_name}</p>
                          <p className="text-xs text-slate-400 truncate">{tx.type} • {formatDate(tx.created_at)}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(tx.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No recent activity" />
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} users</p>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus size={16} />Add User
            </Button>
          </div>

          <Card>
            <CardBody className="p-0">
              {users.length === 0 ? (
                <EmptyState icon={Users} title="No users found" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Contact</th>
                        <th className="px-5 py-3">Account</th>
                        <th className="px-5 py-3 text-right">Balance</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="table-row">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.full_name} size={36} />
                              <div>
                                <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{u.full_name}</p>
                                <p className="text-xs text-slate-400">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-sm text-slate-600 dark:text-slate-300">{u.email}</p>
                            <p className="text-xs text-slate-400">{u.phone}</p>
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-mono text-xs text-slate-600 dark:text-slate-300">{u.account_number}</p>
                            <p className="text-xs text-slate-400">{u.account_type}</p>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-sm text-slate-700 dark:text-slate-200">
                            {formatCurrency(u.balance || 0)}
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={u.is_active ? 'success' : 'error'}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary-500 transition-colors" title="Edit">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleToggleStatus(u.id, u.is_active)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-amber-500 transition-colors" title={u.is_active ? 'Deactivate' : 'Activate'}>
                                <Power size={16} />
                              </button>
                              <button onClick={() => handleDeleteUser(u.id, u.full_name)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by user, account number, description, or transaction ID..."
                    className="input-field pl-11"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {['All', 'Deposit', 'Withdraw', 'Transfer'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTxType(type)}
                      className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        txType === type
                          ? 'gradient-primary text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">From:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-field cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">To:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-field cursor-pointer"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo('') }}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium whitespace-nowrap"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-0">
              {transactions.length === 0 ? (
                <EmptyState title="No transactions found" message="Try adjusting your filters." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Account</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Tx ID</th>
                        <th className="px-5 py-3">Description</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="table-row">
                          <td className="px-5 py-3">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tx.full_name}</p>
                            <p className="text-xs text-slate-400">@{tx.username}</p>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{tx.account_number || '—'}</td>
                          <td className="px-5 py-3">
                            <Badge variant={tx.type === 'Deposit' ? 'success' : tx.type === 'Withdraw' ? 'warning' : 'info'}>
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{tx.transaction_id}</td>
                          <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-200 max-w-xs truncate">{tx.description}</td>
                          <td className="px-5 py-3 text-right font-semibold text-sm text-slate-700 dark:text-slate-200">{formatCurrency(tx.amount)}</td>
                          <td className="px-5 py-3">
                            <Badge variant={tx.status === 'Success' ? 'success' : tx.status === 'Failed' ? 'error' : 'warning'}>
                              {tx.status || 'Success'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Add User Modal */}
      <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add New User" size="lg">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Username</label>
              <input value={addForm.username} onChange={(e) => setAddForm({ ...addForm, username: e.target.value })} className="input-field" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
              <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="input-field" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
              <input value={addForm.full_name} onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })} className="input-field" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
              <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="input-field" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone</label>
              <input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="input-field" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Account Type</label>
              <select value={addForm.account_type} onChange={(e) => setAddForm({ ...addForm, account_type: e.target.value })} className="input-field cursor-pointer">
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Initial Balance (₹)</label>
              <input type="number" step="0.01" value={addForm.initial_balance} onChange={(e) => setAddForm({ ...addForm, initial_balance: parseFloat(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
              <textarea value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} className="input-field resize-none" rows={2} required />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Add User</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAddUser(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!showEditUser} onClose={() => setShowEditUser(null)} title="Edit User" size="lg">
        {showEditUser && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                <input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone</label>
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
                <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="input-field resize-none" rows={2} required />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => setShowEditUser(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
