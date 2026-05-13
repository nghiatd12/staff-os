const STATUS = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  inactive: 'bg-rose-50 text-rose-700 border-rose-200',
}

const LABELS = {
  active: 'Đang hoạt động',
  pending: 'Chờ duyệt',
  inactive: 'Tạm khóa',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-black whitespace-nowrap ${STATUS[status] || STATUS.pending}`}>
      {LABELS[status] || status || 'Chờ duyệt'}
    </span>
  )
}
