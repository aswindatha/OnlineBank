import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, ArrowRightLeft, Search, Download,
} from 'lucide-react'
import { txApi } from '../api/transactions'
import { Card, CardBody, Badge, Spinner, EmptyState, Button } from '../components/ui'

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

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [txType, setTxType] = useState('All')
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    const handler = (e) => setSearch(e.detail)
    window.addEventListener('global-search', handler)
    return () => window.removeEventListener('global-search', handler)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { tx_type: txType, search: search || undefined }
    txApi.getTransactions(params).then((res) => {
      setTransactions(res.data)
    }).finally(() => setLoading(false))
  }, [txType, search])

  const filtered = transactions.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(transactions.length / pageSize)

  const handleExport = () => {
    if (transactions.length === 0) return
    const headers = ['Transaction ID', 'Type', 'Amount', 'Description', 'Date', 'Status']
    const rows = transactions.map((t) => [t.transaction_id, t.type, t.amount, t.description, t.created_at, t.status])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const typeIcon = (type) => {
    if (type === 'Deposit') return <TrendingUp size={16} className="text-emerald-500" />
    if (type === 'Withdraw') return <TrendingDown size={16} className="text-amber-500" />
    return <ArrowRightLeft size={16} className="text-primary-500" />
  }

  const typeBadge = (type) => {
    if (type === 'Deposit') return <Badge variant="success">Deposit</Badge>
    if (type === 'Withdraw') return <Badge variant="warning">Withdraw</Badge>
    return <Badge variant="info">Transfer</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">View your complete transaction history</p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={transactions.length === 0}>
          <Download size={16} />Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                placeholder="Search by description or transaction ID..."
                className="input-field pl-11"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {['All', 'Deposit', 'Withdraw', 'Transfer'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setTxType(type); setPage(0) }}
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
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size={40} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              message="Try adjusting your filters or search query."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Transaction ID</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-right">Balance After</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx) => (
                      <tr key={tx.id} className="table-row">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                              {typeIcon(tx.type)}
                            </div>
                            {typeBadge(tx.type)}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{tx.transaction_id}</td>
                        <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-200 max-w-xs truncate">{tx.description}</td>
                        <td className="px-5 py-3 text-right font-semibold text-sm">
                          <span className={tx.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}>
                            {tx.type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                          {tx.balance_after != null ? formatCurrency(tx.balance_after) : '—'}
                        </td>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, transactions.length)} of {transactions.length}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
