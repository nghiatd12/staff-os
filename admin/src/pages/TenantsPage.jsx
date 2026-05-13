import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import TenantTable from '@/components/TenantTable'

export default function TenantsPage({ setActiveScreen, openTenant, toast }) {
  const [tenants, setTenants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const load = async (nextPage = page) => {
    const params = new URLSearchParams({ page: String(nextPage), limit: '20' })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    const data = await api.get(`/admin/tenants?${params.toString()}`)
    setTenants(data.tenants || [])
    setPage(data.page || nextPage)
    setTotalPages(data.totalPages || 1)
  }

  useEffect(() => {
    load(1).catch(() => {})
  }, [status])

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quán hàng</h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý đăng ký, kích hoạt và tạm khóa quán.</p>
        </div>
        <button onClick={() => setActiveScreen('add-tenant')} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">
          Thêm quán mới
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-soft flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1)}
          placeholder="Tìm tên quán, chủ quán, số điện thoại"
          className="flex-1 min-w-[260px] px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="pending">Chờ duyệt</option>
          <option value="inactive">Tạm khóa</option>
        </select>
        <button onClick={() => load(1)} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold">Tìm kiếm</button>
      </div>

      <TenantTable tenants={tenants} onView={openTenant} onStatusChange={updateStatus} onDelete={deleteTenant} />

      <div className="flex items-center justify-end gap-2">
        <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40">Trước</button>
        <span className="text-sm text-slate-500">Trang {page}/{totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40">Sau</button>
      </div>
    </div>
  )
}
