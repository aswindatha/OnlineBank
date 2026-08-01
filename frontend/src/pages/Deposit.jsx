import { useState, useEffect } from 'react'
import { ArrowDownCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { txApi } from '../api/transactions'
import { accountApi } from '../api/account'
import { Card, CardBody, CardHeader, CardTitle, Button, Modal, Badge, Spinner } from '../components/ui'

const formatCurrency = (amt) => `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Deposit() {
  const { user } = useAuth()
  const toast = useToast()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('Cash Deposit')
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
    setLoading(true)
    try {
      const res = await txApi.deposit(amt, description)
      setReceipt(res.data)
      setBalance(res.data.balance)
      toast.success('Deposit successful!')
      setAmount('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [500, 1000, 5000, 10000]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Deposit</h1>
        <p className="page-subtitle">Add money to your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle><ArrowDownCircle size={18} className="inline mr-2 text-emerald-500" />Deposit Money</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-700/30 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Current Balance</span>
                <span className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(balance)}</span>
              </div>

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
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-all"
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Spinner size={18} /> : <><ArrowDownCircle size={18} />Deposit Now</>}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Instant Credit</p>
                  <p className="text-slate-500 dark:text-slate-400">Your deposit is credited immediately to your account.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">No Fees</p>
                  <p className="text-slate-500 dark:text-slate-400">Deposits are free of charge with no hidden costs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Transaction Receipt</p>
                  <p className="text-slate-500 dark:text-slate-400">A receipt with transaction ID is generated for every deposit.</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Receipt Modal */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Deposit Receipt">
        {receipt && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Deposit Successful</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{receipt.transaction_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">New Balance</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(receipt.balance)}</span>
              </div>
            </div>
            <Button onClick={() => setReceipt(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
