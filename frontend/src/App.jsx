import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { api } from '@/lib/api'
import { getToken, removeToken, getUser, setUser as saveUser, removeUser } from '@/lib/auth'
import { prefetchAll, clearStore, bindSocketToStore } from '@/lib/store'
import { connectSocket, disconnectSocket } from '@/lib/socket'

// Feature pages
import DashboardPage  from '@/features/dashboard/DashboardPage'
import TablesPage     from '@/features/tables/TablesPage'
import OrderPage      from '@/features/order/OrderPage'
import KitchenPage    from '@/features/kitchen/KitchenPage'
import CashierPage    from '@/features/cashier/CashierPage'
import QrMenuPage     from '@/features/qr-menu/QrMenuPage'
import StaffPage      from '@/features/staff/StaffPage'
import CustomersPage  from '@/features/customers/CustomersPage'
import SettingsPage   from '@/features/settings/SettingsPage'

// Auth pages
import LoginPage    from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'

const SCREENS = {
  dashboard:  DashboardPage,
  tables:     TablesPage,
  order:      OrderPage,
  kitchen:    KitchenPage,
  cashier:    CashierPage,
  'qr-menu':  QrMenuPage,
  staff:      StaffPage,
  customers:  CustomersPage,
  settings:   SettingsPage,
}

export default function App() {
  const [currentView, setCurrentView] = useState('loading')
  const [user, setUser] = useState(null)
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Check token on mount + prefetch data
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setCurrentView('login')
      return
    }

    // Validate token + prefetch data song song
    Promise.all([
      api.get('/auth/me'),
      prefetchAll(),
    ])
      .then(([data]) => {
        const userData = data.user
        saveUser(userData)
        setUser(userData)
        setCurrentView('app')
        const socket = connectSocket(userData.role)
        bindSocketToStore(socket)
      })
      .catch(() => {
        removeToken()
        removeUser()
        setCurrentView('login')
      })
  }, [])

  const handleLogin = async (userData) => {
    setUser(userData)
    setCurrentView('app')
    prefetchAll()
    const socket = connectSocket(userData.role)
    bindSocketToStore(socket)
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    clearStore()
    disconnectSocket()
    setUser(null)
    setCurrentView('login')
  }

  // Loading
  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl mx-auto mb-3 animate-pulse" style={{ backgroundColor: '#10b981' }} />
          <p className="text-slate-400 text-sm">Đang tải StaffOS...</p>
        </div>
      </div>
    )
  }

  // Auth pages
  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} onNavigate={(v) => setCurrentView(v)} />
  }
  if (currentView === 'register') {
    return <RegisterPage onNavigate={(v) => setCurrentView(v)} />
  }

  // Main app
  const Screen = SCREENS[activeScreen] ?? DashboardPage

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        active={activeScreen}
        setActive={setActiveScreen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <TopBar activeScreen={activeScreen} user={user} />
        <div className="flex-1 overflow-hidden">
          <Screen setActive={setActiveScreen} />
        </div>
      </main>
    </div>
  )
}
