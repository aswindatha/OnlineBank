import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { notifApi } from '../api/notifications'
import { Card, CardBody, Button, Badge, Spinner, EmptyState } from '../components/ui'
import { useToast } from '../context/ToastContext'

const formatTimeAgo = (dt) => {
  if (!dt) return 'N/A'
  try {
    const diff = (new Date() - new Date(dt)) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} day${diff >= 172800 ? 's' : ''} ago`
    return new Date(dt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dt }
}

const categoryConfig = {
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', badge: 'success' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', badge: 'warning' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', badge: 'error' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', badge: 'info' },
}

export default function Notifications() {
  const toast = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    notifApi.getNotifications(filter === 'unread').then((res) => {
      setNotifications(res.data)
    }).finally(() => setLoading(false))
  }, [filter])

  const handleMarkRead = async (id) => {
    try {
      await notifApi.markRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: 1 } : n))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notifApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="secondary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
          <CheckCheck size={16} />Mark all read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size={40} />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" message="You're all caught up!" />
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const config = categoryConfig[n.category] || categoryConfig.info
                const Icon = config.icon
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                      n.is_read ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-700/20'
                    } hover:bg-slate-50 dark:hover:bg-slate-700/30`}
                  >
                    <div className={`p-2.5 rounded-xl ${config.bg} flex-shrink-0`}>
                      <Icon size={20} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{n.title}</p>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex-shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
