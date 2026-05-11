import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/utils/format'
import { X, Plus, Users, Clock, UtensilsCrossed } from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const TABLE_STATUS_CONFIG = {
  empty: {
    label: 'Trống',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-500',
    dot: 'bg-slate-300',
    pulse: false,
  },
  occupied: {
    label: 'Có khách',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  waiting: {
    label: 'Chờ món',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    pulse: true,
  },
  reserved: {
    label: 'Đặt trước',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    pulse: false,
  },
}

/**
 * TableSidePanel — chi tiết bàn được chọn (cố định)
 */
export default function TableSidePanel({ table, onClose, onOrder, onCashier }) {
  const cfg = TABLE_STATUS_CONFIG[table.status]
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (table.status === 'empty') {
      setItems([])
      return
    }

    setLoading(true)
    api.get('/orders/active')
      .then((data) => {
        const orders = data.orders || []
        // Find order for this table
        const tableOrder = orders.find((o) => o.table_id === table.id)
        setItems(tableOrder?.items || [])
      })
      .catch(() => {
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [table.id, table.status])

  const total = items.reduce((s, i) => s + (i.price * (i.qty || i.quantity || 1)), 0)

  const statusVariant = {
    empty: 'neutral',
    occupied: 'success',
    waiting: 'warning',
    reserved: 'info',
  }

  return (
    <div className="w-80 h-full bg-white rounded-3xl shadow-card border border-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-slate-800">{table.name}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <Badge variant={statusVariant[table.status]} dot>{cfg.label}</Badge>

        {table.status !== 'empty' && (
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users size={12} className="text-slate-400" />
              {table.guests} khách
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              Từ {table.time}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Đang tải...</p>
        </div>
      ) : items.length > 0 ? (
        <>
          {/* Order items — scrollable */}
          <div className="flex-1 p-5 overflow-y-auto min-h-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Món đã gọi ({items.length})
            </p>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.name}</p>
                    <p className="text-[11px] text-slate-400">x{item.qty || item.quantity || 1} · {formatCurrency(item.price)}/phần</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {formatCurrency(item.price * (item.qty || item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — cố định */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500">Tổng cộng</span>
              <span className="text-lg font-bold text-slate-800">{formatCurrency(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="md" onClick={onOrder}>
                <Plus size={14} />
                Gọi thêm
              </Button>
              <Button size="md" onClick={onCashier}>
                Thanh toán
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
            <UtensilsCrossed size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Bàn trống</p>
          <p className="text-slate-400 text-xs mt-1">Chưa có đơn hàng nào</p>
          <Button className="mt-5" size="md" onClick={onOrder}>
            <Plus size={14} />
            Gọi món
          </Button>
        </div>
      )}
    </div>
  )
}
