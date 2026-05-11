/**
 * Global data store — cache + prefetch
 * Load 1 lần khi login, dùng chung cho tất cả trang
 * Re-fetch khi cần (sau khi tạo order, đổi trạng thái bàn...)
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
 * Clear store khi logout
 */
export function clearStore() {
  _tables = []
  _menu = {}
  _categories = []
  _orders = []
  _listeners.clear()
}
