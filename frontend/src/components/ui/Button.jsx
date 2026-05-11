/**
 * Button — nút bấm tái sử dụng theo Design System
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
 * size: 'sm' | 'md' | 'lg'
 */
const VARIANTS = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 shadow-soft hover:shadow-card',
  secondary: 'bg-slate-800 text-white hover:bg-slate-900',
  danger:    'bg-red-500 text-white hover:bg-red-600',
  ghost:     'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
  outline:   'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-2xl',
  lg: 'px-6 py-3 text-sm rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`font-medium transition-all duration-150 inline-flex items-center justify-center gap-2 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
