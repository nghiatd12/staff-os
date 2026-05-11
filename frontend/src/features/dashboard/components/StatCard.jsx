import Card from '@/components/ui/Card'
import { TrendingUp, TrendingDown } from '@/components/ui/Icon'

/**
 * StatCard — thẻ thống kê với trend indicator
 */
export default function StatCard({ label, value, trend, trendUp, icon, iconBg = 'bg-brand-50' }) {
  const trendColor = trendUp === true
    ? 'text-brand-600 bg-brand-50'
    : trendUp === false
      ? 'text-red-600 bg-red-50'
      : 'text-slate-500 bg-slate-50'

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${trendColor}`}>
            {trendUp === true && <TrendingUp size={12} />}
            {trendUp === false && <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
      <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
    </Card>
  )
}
