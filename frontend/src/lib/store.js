/**
 * Global data store — cache + prefetch + realtime socket
 * Load 1 lần khi login, dùng chung cho tất cả trang
 * Tự cập nhật qua Socket.IO khi có order mới / bàn thay đổi
 */
import { api } from './api'

let _tables = []
let _menu = {}
let _categories = []
let _orders = []
let _listeners = new Set()

// Notify all subscribers khi data thay đổi
function notify() {
  _listeners.forEach((fn) => fn())
}

export function subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

// ============ GETTERS ============
export function getTables() { return _tables }
export function getMenu() { return _menu }
export function getCategories() { return _categories }
export function getActiveOrders() { return _orders }

// ============ FETCHERS ============
export async function fetchTables() {
  try {
    const data = await api.get('/tables')
    _tables = data.tables || []
    notify()
  } catch { /* keep old data */ }
  return _tables
}

export async function fetchMenu() {
  try {
    const data = await api.get('/menu')
    _menu = data.menu || {}
    _categories = data.categories || []
    notify()
  } catch { /* keep old data */ }
  return _menu
}

export async function fetchOrders() {
  try {
    const data = await api.get('/orders/active')
    // Luôn replace toàn bộ — đảm bảo sync đúng với DB
    _orders = data.orders || []
    notify()
  } catch { /* keep old data */ }
  return _orders
}

/**
 * Prefetch tất cả data cần thiết — gọi 1 lần sau login
 * Chạy song song để nhanh hơn
 */
export async function prefetchAll() {
  await Promise.all([
    fetchTables(),
    fetchMenu(),
    fetchOrders(),
  ])
}

/**
 * Kết nối store với Socket.IO để tự cập nhật realtime
 * Gọi sau khi socket đã connect
 */
export function bindSocketToStore(socket) {
  if (!socket) return

  // Tránh bind nhiều lần
  socket.off('new-order')
  socket.off('item-updated')
  socket.off('order-completed')
  socket.off('order-ready')
  socket.off('table-updated')

  // Order mới từ phục vụ hoặc khách QR → thêm vào store
  socket.on('new-order', (order) => {
    console.log('[Store] new-order received:', order.id)
    const exists = _orders.find((o) => o.id === order.id)
    if (!exists) {
      _orders = [..._orders, order]
      notify()
    }
  })

  // Cập nhật trạng thái món
  socket.on('item-updated', ({ orderId, item }) => {
    _orders = _orders.map((o) => {
      if (o.id !== orderId) return o
      return {
        ...o,
        items: o.items.map((it) =>
          it.id === item.id ? { ...it, ...item, done: item.status === 'done' } : it
        ),
      }
    })
    notify()
  })

  // Bếp bấm Hoàn thành → xóa khỏi KDS store
  socket.on('order-completed', ({ orderId }) => {
    console.log('[Store] order-completed:', orderId)
    _orders = _orders.filter((o) => o.id !== orderId)
    notify()
  })

  // order-ready cũng xóa khỏi KDS (bếp xong rồi)
  socket.on('order-ready', (order) => {
    console.log('[Store] order-ready:', order.id)
    _orders = _orders.filter((o) => o.id !== order.id)
    notify()
  })

  // Bàn thay đổi trạng thái
  socket.on('table-updated', (tableData) => {
    _tables = _tables.map((t) =>
      t.id === tableData.id ? { ...t, ...tableData } : t
    )
    notify()
  })
}

/**
 * Clear store khi logout
 */
export function clearStore() {
  _tables = []
  _menu = {}
  _categories = []
  _orders = []
  _listeners.clear()
}
