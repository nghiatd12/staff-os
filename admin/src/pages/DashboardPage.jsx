import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import StatCard from '@/components/StatCard'
import TenantTable from '@/components/TenantTable'

const ICONS = {
  total: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  ),
  active: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  pending: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  staff: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
}

export default function DashboardPage({ setActiveScreen, openTenant }) {
  const [stats, setStats] = useState({})
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/tenants?limit=5&sort=newest'),
    ]).then(([s, t]) => {
      setStats(s)
      setTenants(t.tenants || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/tenants/${id}`, { status })
    const data = await api.get('/admin/tenants?limit=5&sort=newest')
    setTenants(data.tenants || [])
  }

  const deleteTenant = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa quán này?')) return
    await api.delete(`/admin/tenants/${id}`)
    setTenants((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Tổng quan</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi trạng thái đăng ký và vận hành toàn bộ quán.</p>
        </div>
        <button
          onClick={() => setActiveScreen('add-tenant')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Thêm quán mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng quán"
          value={loading ? '...' : stats.total}
          hint={`${stats.newThisMonth || 0} mới tháng này`}
          tone="slate"
          icon={ICONS.total}
        />
        <StatCard
          label="Đang hoạt động"
          value={loading ? '...' : stats.active}
          tone="emerald"
          icon={ICONS.active}
        />
        <StatCard
          label="Chờ duyệt"
          value={loading ? '...' : stats.pending}
          tone="amber"
          icon={ICONS.pending}
        />
        <StatCard
          label="Tổng nhân viên"
          value={loading ? '...' : stats.totalEmployees}
          tone="blue"
          icon={ICONS.staff}
        />
      </div>

      {/* Recent tenants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-slate-800">5 quán mới nhất</h2>
            <p className="text-xs text-slate-400 mt-0.5">Các tenant vừa được tạo hoặc đăng ký gần đây</p>
          </div>
          <button
            onClick={() => setActiveScreen('tenants')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:border-slate-300 transition-colors"
          >
            Xem tất cả
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
        <TenantTable tenants={tenants} onView={openTenant} onStatusChange={updateStatus} onDelete={deleteTenant} />
      </div>
    </div>
  )
}
