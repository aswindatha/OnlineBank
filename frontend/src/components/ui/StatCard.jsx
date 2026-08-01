import { TrendingUp, TrendingDown, ArrowRightLeft, Hash } from 'lucide-react'

export function StatCard({ label, value, icon: Icon, gradient = 'gradient-primary', subtitle }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${gradient} text-white`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
