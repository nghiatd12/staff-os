import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import StatCard from '@/components/StatCard'
import TenantTable from '@/components/TenantTable'

export default function DashboardPage({ setActiveScreen, openTenant }) {
  const [stats, setStats] = useState({})
  const [tenants, setTenants] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/tenants?limit=5&sort=newest'),
    ]).then(([statsData, tenantsData]) => {
      setStats(statsData)
      setTenants(tenantsData.tenants || [])
    }).catch(() => {})
  }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/tenants/${id}`, { status })
    const data = await api.get('/admin/tenants?limit=5&sort=newest')
    setTenants(data.tenants || [])
  }

  const deleteTenant = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa quán này?')) return
    await api.delete(`/admin/tenants/${id}`)
    setTenants((prev) => prev.filter((tenant) => tenant.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Tổng quan tất cả quán đang dùng StaffOS.</p>
        </div>
        <button
          onClick={() => setActiveScreen('add-tenant')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
        >
          Thêm quán mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tổng quán" value={stats.total} hint={`${stats.newThisMonth || 0} quán mới tháng này`} />
        <StatCard label="Đang hoạt động" value={stats.active} />
        <StatCard label="Chờ duyệt" value={stats.pending} />
        <StatCard label="Tổng nhân viên" value={stats.totalEmployees} />
      </div>

      <div>
        <h2 className="font-black text-slate-800 mb-3">5 quán mới nhất</h2>
        <TenantTable tenants={tenants} onView={openTenant} onStatusChange={updateStatus} onDelete={deleteTenant} />
      </div>
    </div>
  )
}
