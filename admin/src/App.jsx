import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import TenantsPage from '@/pages/TenantsPage'
import TenantDetailPage from '@/pages/TenantDetailPage'
import AddTenantPage from '@/pages/AddTenantPage'
import RestaurantTypesPage from '@/pages/RestaurantTypesPage'
import { getAdminToken, removeAdminToken } from '@/lib/auth'

export default function App() {
  const [admin, setAdmin] = useState(null)
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [selectedTenantId, setSelectedTenantId] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (getAdminToken()) {
      setAdmin({ email: 'superadmin', role: 'superadmin' })
    }
  }, [])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  const logout = () => {
    removeAdminToken()
    setAdmin(null)
    setActiveScreen('dashboard')
  }

  const openTenant = (id) => {
    setSelectedTenantId(id)
    setActiveScreen('tenant-detail')
  }

  if (!admin) {
    return <LoginPage onLogin={setAdmin} />
  }

  let content = null
  if (activeScreen === 'dashboard') {
    content = <DashboardPage setActiveScreen={setActiveScreen} openTenant={openTenant} />
  } else if (activeScreen === 'tenants') {
    content = <TenantsPage setActiveScreen={setActiveScreen} openTenant={openTenant} toast={showToast} />
  } else if (activeScreen === 'tenant-detail') {
    content = <TenantDetailPage tenantId={selectedTenantId} setActiveScreen={setActiveScreen} toast={showToast} />
  } else if (activeScreen === 'add-tenant') {
    content = <AddTenantPage setActiveScreen={setActiveScreen} toast={showToast} />
  } else if (activeScreen === 'restaurant-types') {
    content = <RestaurantTypesPage toast={showToast} />
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        adminEmail={admin.email}
        onLogout={logout}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {toast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-medium shadow-xl animate-fade-in">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {toast}
          </div>
        )}
        <div className="p-5 lg:p-8 max-w-[1440px] mx-auto">
          {content}
        </div>
      </main>
    </div>
  )
}
