import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/format'
import { api } from '@/lib/api'

export default function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/active')
      .then((data) => {
        const orders = data.orders || []
        // Show last 5 orders
        setRecentOrders(orders.slice(0, 5))
      })
      .catch(() => {
        setRecentOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <div className="p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Đơn hàng gần đây</h3>
          <p className="text-xs text-slate-400 mt-0.5">Cập nhật realtime</p>
        </div>
        <button className="text-brand-600 text-xs font-semibold hover:text-brand-700 transition-colors px-3 py-1.5 rounded-xl hover:bg-brand-50">
          Xem tất cả →
        </button>
      </div>

      {loading ? (
        <div className="p-5 text-center">
          <p className="text-slate-400 text-sm">Đang tải...</p>
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="p-5 text-center">
          <p className="text-slate-400 text-sm">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mã đơn</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bàn</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Số món</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng tiền</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const itemCount = o.items?.length || 0
                const total = (o.items || []).reduce((s, i) => s + (i.price * (i.qty || i.quantity || 1)), 0)
                return (
                  <tr key={o.id} className="table-row-hover border-b border-slate-50 last:border-0">
                    <td className="px-5 py-4 text-sm font-semibold text-brand-600">#{o.id}</td>
                    <td className="px-5 py-4 text-sm text-slate-700 font-medium">{o.table_name || `Bàn ${o.table_id}`}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{itemCount} món</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{formatCurrency(total)}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={o.status === 'completed' ? 'neutral' : 'success'}
                        dot
                      >
                        {o.status === 'completed' ? 'Đã thanh toán' : 'Đang phục vụ'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
