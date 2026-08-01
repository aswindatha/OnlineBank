export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      )}
      <input className={`input-field ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      )}
      <select className={`input-field cursor-pointer ${error ? 'border-red-500' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      )}
      <textarea className={`input-field resize-none ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
