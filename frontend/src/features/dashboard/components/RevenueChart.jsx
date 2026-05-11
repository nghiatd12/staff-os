import Card from '@/components/ui/Card'
import { formatShort } from '@/utils/format'

const revenueData = [
  { day: 'T2', value: 3200000 },
  { day: 'T3', value: 2800000 },
  { day: 'T4', value: 4100000 },
  { day: 'T5', value: 3700000 },
  { day: 'T6', value: 5200000 },
  { day: 'T7', value: 6800000 },
  { day: 'CN', value: 2450000 },
]

export default function RevenueChart() {
  const maxVal = Math.max(...revenueData.map((d) => d.value))

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Doanh thu 7 ngày</h3>
          <p className="text-xs text-slate-400 mt-0.5">So sánh theo ngày trong tuần</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-xs text-slate-500">Hôm nay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-200" />
            <span className="text-xs text-slate-500">Các ngày khác</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 h-44">
        {revenueData.map((d, i) => {
          const isToday = i === revenueData.length - 1
          const height = (d.value / maxVal) * 140
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[11px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatShort(d.value)}
              </span>
              <div className="w-full relative">
                <div
                  className={`w-full rounded-xl transition-all duration-300 group-hover:opacity-80 ${
                    isToday
                      ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-md shadow-brand-200'
                      : 'bg-brand-100 group-hover:bg-brand-200'
                  }`}
                  style={{ height: `${height}px` }}
                />
              </div>
              <span className={`text-xs font-medium ${isToday ? 'text-brand-600' : 'text-slate-400'}`}>
                {d.day}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
