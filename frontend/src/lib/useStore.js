import { useState, useEffect, useCallback } from 'react'
import { subscribe, getTables, getMenu, getCategories, getActiveOrders, fetchTables, fetchMenu, fetchOrders } from './store'

/**
 * Hook để subscribe vào store — component tự re-render khi data thay đổi
 */
function useStoreSubscription() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1))
  }, [])
}

export function useTables() {
  useStoreSubscription()
  const tables = getTables()
  const refresh = useCallback(() => fetchTables(), [])
  return { tables, refresh, loading: tables.length === 0 }
}

export function useMenu() {
  useStoreSubscription()
  const menu = getMenu()
  const categories = getCategories()
  const refresh = useCallback(() => fetchMenu(), [])
  return { menu, categories, refresh, loading: Object.keys(menu).length === 0 }
}

export function useOrders() {
  useStoreSubscription()
  const orders = getActiveOrders()
  const refresh = useCallback(() => fetchOrders(), [])
  return { orders, refresh, loading: false }
}
