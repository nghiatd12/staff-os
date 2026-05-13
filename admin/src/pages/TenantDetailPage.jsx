import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import StatCard from '@/components/StatCard'

function money(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ'
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-700 text-right truncate">{value || '—'}</span>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm transition"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

export default function TenantDetailPage({ tenantId, setActiveScreen, toast }) {
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ status: 'pending', plan: 'starter', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const next = await api.get(`/admin/tenants/${tenantId}`)
    setData(next)
    setForm({
      status: next.tenant.status || 'pending',
      plan: next.tenant.plan || 'starter',
      notes: next.tenant.notes || '',
    })
    setLoading(false)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [tenantId])

  const save = async () => {
    setSaving(true)
    await api.patch(`/admin/tenants/${tenantId}`, form)
    toast?.('Đã lưu thay đổi.')
    await load()
    setSaving(false)
  }

  const remove = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa quán này? Hành động này không thể hoàn tác.')) return
    await api.delete(`/admin/tenants/${tenantId}`)
    toast?.('Đã xóa quán.')
    setActiveScreen('tenants')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400 text-sm">Đang tải chi tiết...</p>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500 text-sm">Không tải được chi tiết quán.</p>
      </div>
    )
  }

  const { tenant, owner, stats } = data

  return (
    <div className="space-y-5 fade-in">
      {/* Breadcrumb + header */}
      <div>
        <button
          onClick={() => setActiveScreen('tenants')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại danh sách
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl font-bold text-emerald-600 shrink-0">
              {(tenant.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{tenant.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{tenant.address || 'Chưa có địa chỉ'} · <span className="font-mono text-xs">{tenant.slug}</span></p>
            </div>
          </div>
          <StatusBadge status={tenant.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng orders"
          value={stats.totalOrders}
          tone="slate"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>}
        />
        <StatCard
          label="Doanh thu tháng này"
          value={money(stats.revenueThisMonth)}
          tone="emerald"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          label="Tổng nhân viên"
          value={stats.totalEmployees}
          tone="blue"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-1">Thông tin quán</h2>
          <p className="text-xs text-slate-400 mb-4">Dữ liệu cấu hình tenant</p>
          <Info label="Slug" value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{tenant.slug}</span>} />
          <Info label="Loại quán" value={tenant.type} />
          <Info label="Số bàn" value={tenant.table_count} />
          <Info label="Gói dịch vụ" value={tenant.plan?.toUpperCase()} />
          <Info label="Nguồn đăng ký" value={tenant.registered_by || 'Admin'} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-1">Thông tin chủ quán</h2>
          <p className="text-xs text-slate-400 mb-4">Tài khoản owner của quán</p>
          <Info label="Họ tên" value={owner?.name || tenant.owner_name} />
          <Info label="Số điện thoại" value={owner?.phone || tenant.phone} />
          <Info label="Email" value={tenant.owner_email} />
          <Info label="Trạng thái TK" value={owner?.is_active ? '✓ Đang bật' : 'Chưa rõ'} />
        </div>
      </div>

      {/* Edit panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-1">Cập nhật vận hành</h2>
        <p className="text-xs text-slate-400 mb-5">Thay đổi trạng thái, gói dịch vụ và ghi chú nội bộ</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Trạng thái"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[['pending','Chờ duyệt'],['active','Đang hoạt động'],['inactive','Tạm khóa']]}
          />
          <Select
            label="Gói dịch vụ"
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            options={[['starter','Starter'],['pro','Pro'],['business','Business']]}
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú nội bộ</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Ghi chú về quán này..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm resize-none transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {saving ? 'Đang lưu...' : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Lưu thay đổi
              </>
            )}
          </button>
          <button
            onClick={remove}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm hover:bg-rose-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Xóa quán
          </button>
        </div>
      </div>
    </div>
  )
}
