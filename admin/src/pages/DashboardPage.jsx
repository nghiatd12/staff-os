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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tổng quan</p>
          <h1 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-2">Theo dõi trạng thái đăng ký và vận hành của toàn bộ quán.</p>
        </div>
        <button
          onClick={() => setActiveScreen('add-tenant')}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          Thêm quán mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tổng quán" value={stats.total} hint={`${stats.newThisMonth || 0} quán mới tháng này`} />
        <StatCard label="Đang hoạt động" value={stats.active} tone="emerald" />
        <StatCard label="Chờ duyệt" value={stats.pending} tone="amber" />
        <StatCard label="Tổng nhân viên" value={stats.totalEmployees} tone="slate" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-lg">5 quán mới nhất</h2>
            <p className="text-sm text-slate-500 mt-0.5">Các tenant vừa được tạo hoặc đăng ký gần đây.</p>
          </div>
          <button onClick={() => setActiveScreen('tenants')} className="px-4 py-2 rounded-xl bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:border-emerald-200">
            Xem tất cả
          </button>
        </div>
        <TenantTable tenants={tenants} onView={openTenant} onStatusChange={updateStatus} onDelete={deleteTenant} />
      </div>
    </div>
  )
}
