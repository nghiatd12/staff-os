const TONES = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   icon: 'text-amber-400' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    icon: 'text-rose-400' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    icon: 'text-blue-400' },
  slate:   { bg: 'bg-slate-100',      text: 'text-slate-500',   icon: 'text-slate-400' },
}

export default function StatCard({ label, value, hint, tone = 'slate', icon, delta }) {
  const t = TONES[tone] || TONES.slate

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-medium text-slate-500 leading-tight">{label}</p>
        {icon && (
          <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center shrink-0 ${t.icon}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 tracking-tight">{value ?? '—'}</p>
      {(hint || delta !== undefined) && (
        <div className="flex items-center gap-2 mt-2">
          {delta !== undefined && (
            <span className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}
            </span>
          )}
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      )}
    </div>
  )
}
