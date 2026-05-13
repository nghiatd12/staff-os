export default function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-3">{value ?? 0}</p>
      {hint && <p className="text-xs text-slate-400 mt-2">{hint}</p>}
    </div>
  )
}
