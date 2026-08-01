import { useState, useEffect } from 'react'
import { Send, CheckCircle, Users, Clock } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { txApi } from '../api/transactions'
import { accountApi } from '../api/account'
import { Card, CardBody, CardHeader, CardTitle, Button, Modal, Avatar, Badge, Spinner } from '../components/ui'

const formatCurrency = (amt) => `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Transfer() {
  const toast = useToast()
  const [balance, setBalance] = useState(0)
  const [users, setUsers] = useState([])
  const [recipients, setRecipients] = useState([])
  const [receiverId, setReceiverId] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('Fund Transfer')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    Promise.all([
      accountApi.getBalance(),
      accountApi.getActiveUsers(),
      txApi.getRecentRecipients(),
    ]).then(([balRes, usersRes, recipRes]) => {
      setBalance(balRes.data.balance)
      setUsers(usersRes.data)
      setRecipients(recipRes.data)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!receiverId) {
      toast.error('Please select a recipient')
      return
    }
    if (amt > balance) {
      toast.error('Insufficient balance for this transfer')
      return
    }
    setLoading(true)
    try {
      const res = await txApi.transfer(parseInt(receiverId), amt, remarks)
      setReceipt({ ...res.data, receiver_name: users.find((u) => u.id === parseInt(receiverId))?.full_name })
      setBalance(res.data.balance)
      toast.success('Transfer successful!')
      setAmount('')
      setReceiverId('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Transfer</h1>
        <p className="page-subtitle">Send money to other accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle><Send size={18} className="inline mr-2 text-primary-500" />Transfer Money</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-700/30 flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Available Balance</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(balance)}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Select Recipient</label>
                  <select value={receiverId} onChange={(e) => setReceiverId(e.target.value)} className="input-field cursor-pointer" required>
                    <option value="">Choose a recipient...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} (@{u.username})
                      </option>
                    ))}
                  </select>
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
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="input-field"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Spinner size={18} /> : <><Send size={18} />Send Money</>}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle><Clock size={18} className="inline mr-2" />Recent Recipients</CardTitle>
            </CardHeader>
            <CardBody>
              {recipients.length > 0 ? (
                <div className="space-y-3">
                  {recipients.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReceiverId(String(r.id))}
                      className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <Avatar name={r.full_name} size={36} />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.full_name}</p>
                        <p className="text-xs text-slate-400">@{r.username}</p>
                      </div>
                      {receiverId === String(r.id) && <CheckCircle size={18} className="text-primary-500" />}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No recent recipients</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><Users size={18} className="inline mr-2" />All Users</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.slice(0, 8).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setReceiverId(String(u.id))}
                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Avatar name={u.full_name} size={28} />
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{u.full_name}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Transfer Receipt">
        {receipt && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex p-4 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-3">
                <CheckCircle size={40} className="text-primary-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transfer Successful</h3>
              {receipt.receiver_name && (
                <p className="text-sm text-slate-500 mt-1">Sent to {receipt.receiver_name}</p>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{receipt.transaction_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">New Balance</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(receipt.balance)}</span>
              </div>
            </div>
            <Button onClick={() => setReceipt(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
