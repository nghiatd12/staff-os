/**
 * Card — khung trắng bo góc lớn, shadow mềm
 * Hỗ trợ hover effect qua prop `hover`
 */
export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-soft border border-slate-100 ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
