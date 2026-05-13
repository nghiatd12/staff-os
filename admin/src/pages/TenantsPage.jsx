import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import TenantTable from '@/components/TenantTable'

export default function TenantsPage({ setActiveScreen, openTenant, toast }) {
  const [tenants, setTenants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (nextPage = page) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(nextPage), limit: '20' })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    const data = await api.get(`/admin/tenants?${params.toString()}`)
    setTenants(data.tenants || [])
    setPage(data.page || nextPage)
    setTotalPages(data.totalPages || 1)
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { load(1).catch(() => setLoading(false)) }, [status])

  const updateStatus = async (id, value) => {
    await api.patch(`/admin/tenants/${id}`, { status: value })
    toast?.('Đã đổi trạng thái quán.')
    await load()
  }

  const deleteTenant = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa quán này?')) return
    await api.delete(`/admin/tenants/${id}`)
    toast?.('Đã xóa quán.')
    await load()
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Tenant</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quán hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý đăng ký, kích hoạt và tạm khóa quán.</p>
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

      {/* Search & filter */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="Tìm tên quán, chủ quán, SĐT..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm transition"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:border-emerald-400"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="pending">Chờ duyệt</option>
          <option value="inactive">Tạm khóa</option>
        </select>
        <button
          onClick={() => load(1)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          Tìm kiếm
        </button>
        {total > 0 && (
          <span className="text-sm text-slate-400 ml-auto">{total} quán</span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <p className="text-slate-400 text-sm">Đang tải...</p>
        </div>
      ) : (
        <TenantTable tenants={tenants} onView={openTenant} onStatusChange={updateStatus} onDelete={deleteTenant} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Trang {page} / {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:border-slate-300 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:border-slate-300 transition-colors"
            >
              Sau
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
