import { useState, useEffect } from 'react'
import { FileText, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { txApi } from '../api/transactions'
import { Card, CardBody, Badge, Spinner, EmptyState } from '../components/ui'

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

export default function MiniStatement() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    txApi.getMiniStatement(10).then((res) => {
      setTransactions(res.data)
    }).finally(() => setLoading(false))
  }, [])

  const typeIcon = (type) => {
    if (type === 'Deposit') return <TrendingUp size={18} className="text-emerald-500" />
    if (type === 'Withdraw') return <TrendingDown size={18} className="text-amber-500" />
    return <ArrowRightLeft size={18} className="text-primary-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mini Statement</h1>
        <p className="page-subtitle">Last 10 transactions at a glance</p>
      </div>

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size={40} />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={FileText} title="No transactions yet" message="Your recent transactions will appear here." />
          ) : (
            <div className="space-y-1">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'Deposit' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    tx.type === 'Withdraw' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-primary-100 dark:bg-primary-900/30'
                  }`}>
                    {typeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={tx.type === 'Deposit' ? 'success' : tx.type === 'Withdraw' ? 'warning' : 'info'}>
                        {tx.type}
                      </Badge>
                      <span className="font-mono text-xs text-slate-400">{tx.transaction_id}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(tx.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${tx.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {tx.type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    {tx.balance_after != null && (
                      <p className="text-xs text-slate-400">Bal: {formatCurrency(tx.balance_after)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
