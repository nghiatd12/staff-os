import { useState, useEffect, useRef } from 'react'
import { ChefHat, Clock } from '@/components/ui/Icon'
import { api } from '@/lib/api'
import { useOrders } from '@/lib/useStore'
import { fetchOrders } from '@/lib/store'
import { notifyNewOrder, notifyOrderReady, unlockAudio } from '@/lib/sound'
import KdsCard from './components/KdsCard'

export default function KitchenPage() {
  const { orders: storeOrders } = useOrders()
  const [orders, setOrders] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastNotified, setLastNotified] = useState(null) // tránh beep trùng
  const prevOrderIds = useRef(new Set())

  // Sync from store + detect order mới để phát âm thanh
  useEffect(() => {
    const incoming = storeOrders.length > 0 ? storeOrders : []

    if (incoming.length > 0) {
      // Tìm order mới (chưa có trong prevOrderIds)
      const newOrders = incoming.filter((o) => !prevOrderIds.current.has(o.id))

      if (newOrders.length > 0 && soundEnabled) {
        // Phát âm thanh cho order mới nhất
        const latest = newOrders[newOrders.length - 1]
        const tableName = latest.table_name || latest.table || `Đơn ${latest.id}`
        notifyNewOrder(tableName)
        setLastNotified(latest.id)
      }

      // Cập nhật set
      prevOrderIds.current = new Set(incoming.map((o) => o.id))
      setOrders(incoming)
    } else if (storeOrders.length === 0 && orders.length === 0) {
      fetchOrders().then((data) => {
        setOrders(data)
        prevOrderIds.current = new Set(data.map((o) => o.id))
      })
    }
  }, [storeOrders, soundEnabled])

  // Lắng nghe Socket.IO new-order trực tiếp (cho KDS không qua store)
  useEffect(() => {
    // Import socket lazily để tránh circular
    let socket = null
    import('@/lib/socket').then(({ getSocket }) => {
      socket = getSocket()
      if (!socket) return

      const handleNewOrder = (order) => {
        if (!soundEnabled) return
        const tableName = order.table_name || order.table || `Đơn ${order.id}`
        notifyNewOrder(tableName)

        // Thêm vào danh sách nếu chưa có
        setOrders((prev) => {
          if (prev.find((o) => o.id === order.id)) return prev
          return [...prev, order]
        })
        prevOrderIds.current.add(order.id)
      }

      const handleOrderReady = (order) => {
        if (!soundEnabled) return
        const tableName = order.table_name || order.table || `Đơn ${order.id}`
        notifyOrderReady(tableName)
      }

      socket.on('new-order', handleNewOrder)
      socket.on('order-ready', handleOrderReady)

      return () => {
        socket.off('new-order', handleNewOrder)
        socket.off('order-ready', handleOrderReady)
      }
    }).catch(() => {})

    return () => {
      if (socket) {
        socket.off('new-order')
        socket.off('order-ready')
      }
    }
  }, [soundEnabled])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleItem = async (orderId, itemIdx) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const item = order.items[itemIdx]
    if (!item) return

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it) }
          : o
      )
    )

    try {
      const itemId = item.id || itemIdx
      const newStatus = item.done ? 'pending' : 'done'
      await api.patch(`/orders/${orderId}/items/${itemId}`, { status: newStatus })
    } catch {
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
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    try {
      await api.patch(`/orders/${orderId}/complete`)
    } catch {
      api.get('/orders/active')
        .then((data) => setOrders(data.orders || []))
        .catch(() => {})
    }
  }

  // Unlock audio khi user click lần đầu vào trang
  const handleFirstClick = () => {
    unlockAudio()
    document.removeEventListener('click', handleFirstClick)
  }
  useEffect(() => {
    document.addEventListener('click', handleFirstClick)
    return () => document.removeEventListener('click', handleFirstClick)
  }, [])

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

        <div className="flex items-center gap-4">
          {/* Sound toggle */}
          <button
            onClick={() => {
              unlockAudio()
              setSoundEnabled((v) => !v)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            <span className="text-base">{soundEnabled ? '🔔' : '🔕'}</span>
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh bật' : 'Âm thanh tắt'}</span>
          </button>

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
