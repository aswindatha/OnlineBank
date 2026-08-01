import { useState, useEffect } from 'react'
import { ArrowUpCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { txApi } from '../api/transactions'
import { accountApi } from '../api/account'
import { Card, CardBody, CardHeader, CardTitle, Button, Modal, Spinner } from '../components/ui'

const formatCurrency = (amt) => `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Withdraw() {
  const toast = useToast()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('Cash Withdrawal')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    accountApi.getBalance().then((res) => setBalance(res.data.balance))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (amt > balance) {
      toast.error('Insufficient balance for this withdrawal')
      return
    }
    setLoading(true)
    try {
      const res = await txApi.withdraw(amt, description)
      setReceipt(res.data)
      setBalance(res.data.balance)
      toast.success('Withdrawal successful!')
      setAmount('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [500, 1000, 5000, 10000]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Withdraw</h1>
        <p className="page-subtitle">Withdraw money from your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle><ArrowUpCircle size={18} className="inline mr-2 text-amber-500" />Withdraw Money</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-700/30 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Available Balance</span>
                <span className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(balance)}</span>
              </div>

              {balance === 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm">
                  <AlertTriangle size={18} />
                  Your account has zero balance. Please deposit first.
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-2xl font-bold"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(String(amt))}
                    disabled={amt > balance}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />
              </div>

              <Button type="submit" disabled={loading || balance === 0} className="w-full">
                {loading ? <Spinner size={18} /> : <><ArrowUpCircle size={18} />Withdraw Now</>}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Instant Debit</p>
                  <p className="text-slate-500 dark:text-slate-400">Your withdrawal is processed immediately from your account.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Balance Check</p>
                  <p className="text-slate-500 dark:text-slate-400">Ensure you have sufficient balance before withdrawing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Transaction Receipt</p>
                  <p className="text-slate-500 dark:text-slate-400">A receipt with transaction ID is generated for every withdrawal.</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Withdrawal Receipt">
        {receipt && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                <CheckCircle size={40} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Withdrawal Successful</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{receipt.transaction_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">New Balance</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(receipt.balance)}</span>
              </div>
            </div>
            <Button onClick={() => setReceipt(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
