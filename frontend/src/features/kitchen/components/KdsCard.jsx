import { useState, useEffect } from 'react'

/**
 * KdsCard — thẻ đơn hàng trên màn hình bếp (KDS)
 * Compact design: header rõ tên bàn + số phút tính realtime
 */

function getTimeLevel(minutes) {
  if (minutes < 12) return 'green'
  if (minutes < 20) return 'yellow'
  return 'red'
}

function getElapsedMinutes(createdAt) {
  if (!createdAt) return 0
  const diff = Date.now() - new Date(createdAt).getTime()
  return Math.floor(diff / 60000)
}

const LEVEL_STYLES = {
  green: {
    border: 'border-l-4 border-l-emerald-400 border border-slate-100',
    headerBg: 'bg-emerald-500',
    badge: 'bg-white/20 text-white',
    bar: 'bg-emerald-300',
  },
  yellow: {
    border: 'border-l-4 border-l-amber-400 border border-slate-100',
    headerBg: 'bg-amber-500',
    badge: 'bg-white/20 text-white',
    bar: 'bg-amber-300',
  },
  red: {
    border: 'border-l-4 border-l-red-500 border border-slate-100',
    headerBg: 'bg-red-500',
    badge: 'bg-white/20 text-white',
    bar: 'bg-red-300',
  },
}

export default function KdsCard({ order, onToggleItem, onComplete }) {
  const [elapsed, setElapsed] = useState(() => getElapsedMinutes(order.created_at))

  // Cập nhật số phút mỗi 30 giây
  useEffect(() => {
    setElapsed(getElapsedMinutes(order.created_at))
    const timer = setInterval(() => {
      setElapsed(getElapsedMinutes(order.created_at))
    }, 30000)
    return () => clearInterval(timer)
  }, [order.created_at])

  const level = getTimeLevel(elapsed)
  const style = LEVEL_STYLES[level]

  // Normalize items — hỗ trợ cả field done và status
  const items = (order.items || []).map((item) => ({
    ...item,
    done: item.done || item.status === 'done',
    qty: item.qty || item.quantity || 1,
  }))

  const doneCount = items.filter((i) => i.done).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const allDone = doneCount >= totalCount && totalCount > 0

  // Tên bàn — hỗ trợ nhiều field name khác nhau
  const tableName = order.table_name || order.table || `#${order.id}`

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm ${style.border} ${level === 'red' ? 'pulse-live' : ''}`}>

      {/* ── Header compact ── */}
      <div className={`${style.headerBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          {/* Số thứ tự đơn */}
          <span className="text-white/70 text-xs font-medium shrink-0">#{order.id}</span>
          {/* Tên bàn — to và rõ */}
          <span className="text-white font-bold text-lg leading-none truncate">{tableName}</span>
          {/* Guest order badge */}
          {order.source === 'guest' && (
            <span className="bg-white/20 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0">
              QR
            </span>
          )}
        </div>

        {/* Số phút — luôn hiện */}
        <div className={`${style.badge} flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-xs font-bold">{elapsed} phút</span>
        </div>
      </div>

      {/* ── Progress bar mỏng ── */}
      <div className="h-1.5 bg-slate-100">
        <div
          className={`h-full ${style.bar} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Items ── */}
      <div className="p-3">
        {/* Counter nhỏ */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-400 font-medium">
            {doneCount}/{totalCount} món
          </span>
          {allDone && (
            <span className="text-[11px] text-emerald-600 font-semibold">✓ Xong hết</span>
          )}
        </div>

        <div className="space-y-1.5 mb-3">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => onToggleItem(order.id, idx)}
              role="button"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all select-none active:scale-95 ${
                item.done
                  ? 'bg-emerald-50 opacity-60'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                item.done ? 'bg-emerald-500' : 'border-2 border-slate-300 bg-white'
              }`}>
                {item.done && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>

              {/* Tên món */}
              <span className={`text-sm flex-1 leading-tight ${
                item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
              }`}>
                {item.name}
              </span>

              {/* Số lượng */}
              <span className={`text-xs font-bold shrink-0 ${
                item.done ? 'text-slate-300' : 'text-slate-500'
              }`}>
                ×{item.qty}
              </span>
            </div>
          ))}
        </div>

        {/* Nút Hoàn thành */}
        <button
          onClick={() => onComplete(order.id)}
          disabled={!allDone}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5"
          style={
            allDone
              ? { backgroundColor: '#10b981', color: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }
              : { backgroundColor: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed' }
          }
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Hoàn thành
        </button>
      </div>
    </div>
  )
}
