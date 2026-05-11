/**
 * Avatar — vòng tròn/bo góc hiển thị chữ viết tắt hoặc ảnh
 * shape: 'circle' | 'rounded'
 */
const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

export default function Avatar({
  initials,
  src,
  colorClass = 'bg-brand-500',
  size = 'md',
  shape = 'rounded',
  className = '',
}) {
  const sizeClass = SIZES[size] || SIZES.md
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  if (src) {
    return (
      <img
        src={src}
        alt={initials || ''}
        className={`${sizeClass} ${shapeClass} object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`${shapeClass} ${colorClass} ${sizeClass} flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
