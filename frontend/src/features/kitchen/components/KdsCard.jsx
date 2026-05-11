import { Check, ChefHat } from '@/components/ui/Icon'

/**
 * KdsCard — thẻ đơn hàng trên màn hình bếp (KDS)
 */

const TIME_STYLES = {
  green: {
    border: 'border-emerald-200',
    header: 'bg-emerald-50',
    badge: 'bg-emerald-500 text-white',
    barColor: 'bg-emerald-400',
  },
  yellow: {
    border: 'border-amber-200',
    header: 'bg-amber-50',
    badge: 'bg-amber-500 text-white',
    barColor: 'bg-amber-400',
  },
  red: {
    border: 'border-red-200',
    header: 'bg-red-50',
    badge: 'bg-red-500 text-white',
    barColor: 'bg-red-400',
  },
}

function getTimeLevel(elapsed) {
  if (elapsed < 12) return 'green'
  if (elapsed < 20) return 'yellow'
  return 'red'
}

export default function KdsCard({ order, onToggleItem, onComplete }) {
  const level = getTimeLevel(order.elapsed)
  const style = TIME_STYLES[level]
  const doneCount = order.items.filter((i) => i.done).length
  const totalCount = order.items.length
  const progress = (doneCount / totalCount) * 100
  const allDone = doneCount >= totalCount

  return (
    <div className={`bg-white rounded-3xl border ${style.border} overflow-hidden shadow-soft transition-all hover:shadow-card ${level === 'red' ? 'pulse-live' : ''}`}>
      {/* Header */}
      <div className={`${style.header} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <ChefHat size={18} className="text-slate-600" />
          <span className="text-slate-800 font-bold text-base">{order.table}</span>
          <span className="text-slate-400 text-xs">#{order.id}</span>
        </div>
        <span className={`${style.badge} text-xs font-bold px-2.5 py-1 rounded-xl`}>
          {order.elapsed} phút
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Tiến độ</span>
          <span className="text-[10px] text-slate-500 font-semibold">{doneCount}/{totalCount}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="p-5 pt-3">
        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onToggleItem(order.id, idx)}
              role="button"
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all select-none ${
                item.done
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : 'bg-slate-50 border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-100'
              }`}
            >
              {/* Checkbox — luôn hiện rõ */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.done
                    ? 'bg-emerald-500'
                    : 'bg-white border-2 border-slate-300'
                }`}
                style={item.done ? { backgroundColor: '#10b981' } : {}}
              >
                {item.done && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>

              {/* Item name */}
              <span className={`text-sm flex-1 ${
                item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
              }`}>
                {item.name}
              </span>

              {/* Quantity */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                x{item.qty}
              </span>
            </div>
          ))}
        </div>

        {/* Complete button — dùng inline style đảm bảo luôn hiện */}
        <button
          onClick={() => onComplete(order.id)}
          disabled={!allDone}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={
            allDone
              ? { backgroundColor: '#10b981', color: '#ffffff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }
              : { backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', cursor: 'not-allowed' }
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>Hoàn thành</span>
        </button>
      </div>
    </div>
  )
}
