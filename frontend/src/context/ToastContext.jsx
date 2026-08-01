import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, category = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, category }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info: (msg) => showToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => {
          const Icon = icons[t.category] || Info
          return (
            <div
              key={t.id}
              className="toast-enter flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white min-w-[280px] max-w-md"
              style={{ backgroundColor: undefined }}
            >
              <div className={`flex items-center gap-3 flex-1 ${styles[t.category] || styles.info} rounded-xl p-3 w-full`}>
                <Icon size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{t.message}</span>
                <button onClick={() => removeToast(t.id)} className="flex-shrink-0 opacity-80 hover:opacity-100">
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
