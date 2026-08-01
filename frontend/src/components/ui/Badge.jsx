export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    neutral: 'badge-neutral',
  }
  return (
    <span className={`${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  )
}
