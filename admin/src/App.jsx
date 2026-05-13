import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import TenantsPage from '@/pages/TenantsPage'
import TenantDetailPage from '@/pages/TenantDetailPage'
import AddTenantPage from '@/pages/AddTenantPage'
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
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        adminEmail={admin.email}
        onLogout={logout}
      />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-soft">
            {toast}
          </div>
        )}
        {content}
      </main>
    </div>
  )
}
