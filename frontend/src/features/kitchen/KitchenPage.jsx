import { useState, useEffect } from 'react'
import { ChefHat, Clock } from '@/components/ui/Icon'
import { api } from '@/lib/api'
import { useOrders } from '@/lib/useStore'
import { fetchOrders } from '@/lib/store'
import KdsCard from './components/KdsCard'

export default function KitchenPage() {
  const { orders: storeOrders } = useOrders()
  const [orders, setOrders] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Sync from store
  useEffect(() => {
    if (storeOrders.length > 0) {
      setOrders(storeOrders)
    } else {
      // First load — fetch if store empty
      fetchOrders().then((data) => setOrders(data))
    }
  }, [storeOrders])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleItem = async (orderId, itemIdx) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const item = order.items[itemIdx]
    if (!item) return

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it) }
          : o
      )
    )

    // Call API — use item.id if available
    try {
      const itemId = item.id || itemIdx
      const newStatus = item.done ? 'pending' : 'done'
      await api.patch(`/orders/${orderId}/items/${itemId}`, { status: newStatus })
    } catch {
      // Revert on failure
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, items: o.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it) }
            : o
        )
      )
    }
  }

  const completeOrder = async (orderId) => {
    // Optimistic update
    setOrders((prev) => prev.filter((o) => o.id !== orderId))

    try {
      await api.patch(`/orders/${orderId}/complete`)
    } catch {
      // Re-fetch on failure
      api.get('/orders/active')
        .then((data) => setOrders(data.orders || []))
        .catch(() => {})
    }
  }

  return (
    <div className="h-full flex flex-col fade-in overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center">
            <ChefHat size={22} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-slate-800 font-bold text-lg tracking-tight">Màn hình bếp</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <p className="text-slate-400 text-xs">{orders.length} đơn đang chờ xử lý</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3">
            {[
              { color: 'bg-brand-500',  label: '< 12 phút' },
              { color: 'bg-amber-500',  label: '12–20 phút' },
              { color: 'bg-red-500',    label: '> 20 phút' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-xl">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-slate-500 text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Clock */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <Clock size={18} className="text-slate-400" />
            <div className="text-right">
              <div className="text-slate-800 font-mono text-xl font-bold tracking-wider">
                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-slate-400 text-[11px]">
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-soft flex items-center justify-center mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <p className="text-xl font-bold text-slate-800">Tất cả đơn đã hoàn thành!</p>
            <p className="text-slate-400 text-sm mt-1">Đang chờ đơn mới...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <KdsCard
                key={order.id}
                order={order}
                onToggleItem={toggleItem}
                onComplete={completeOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
