interface BadgeProps {
  text: string
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'paid' | 'unpaid'
  size?: 'sm' | 'md'
}

export default function Badge({
  text,
  variant = 'primary',
  size = 'sm',
}: BadgeProps) {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    paid: 'badge-paid',
    unpaid: 'badge-unpaid',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {text}
    </span>
  )
}
