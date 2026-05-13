const CONFIG = {
  active:   { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Hoạt động' },
  pending:  { cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400',   label: 'Chờ duyệt' },
  inactive: { cls: 'bg-slate-100 text-slate-500 border-slate-200',      dot: 'bg-slate-400',   label: 'Tạm khóa' },
}

export default function StatusBadge({ status }) {
  const c = CONFIG[status] || CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
