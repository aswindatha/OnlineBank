export function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-primary-500 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size={48} />
    </div>
  )
}
