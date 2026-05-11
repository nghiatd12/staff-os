/**
 * Badge — nhãn trạng thái theo Design System
 * variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral'
 * dot: hiển thị chấm tròn trước text
 */
const VARIANTS = {
  success: 'bg-brand-50 text-brand-700',
  warning: 'bg-amber-50 text-amber-700',
  info:    'bg-blue-50 text-blue-700',
  danger:  'bg-red-50 text-red-700',
  neutral: 'bg-slate-100 text-slate-600',
}

const DOT_COLORS = {
  success: 'bg-brand-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
  danger:  'bg-red-500',
  neutral: 'bg-slate-400',
}

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[variant]}`} />}
      {children}
    </span>
  )
}
