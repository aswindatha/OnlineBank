export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={`${hover ? 'glass-card-hover' : 'glass-card'} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 pt-5 pb-2 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`section-title ${className}`}>{children}</h3>
}
