export default function StatCard({ label, value, hint, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="text-3xl font-black text-slate-800 mt-3 tracking-tight">{value ?? 0}</p>
        </div>
        <span className={`w-10 h-10 rounded-2xl border ${tones[tone] || tones.emerald}`} />
      </div>
      {hint && <p className="text-xs text-slate-400 mt-3">{hint}</p>}
    </div>
  )
}
