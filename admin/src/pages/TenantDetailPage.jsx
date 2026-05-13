import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import StatCard from '@/components/StatCard'

function money(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ'
}

export default function TenantDetailPage({ tenantId, setActiveScreen, toast }) {
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ status: 'pending', plan: 'starter', notes: '' })
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    load().catch(() => setLoading(false))
  }, [tenantId])

  const save = async () => {
    await api.patch(`/admin/tenants/${tenantId}`, form)
    toast?.('Đã lưu thay đổi.')
    await load()
  }

  const remove = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa quán này?')) return
    await api.delete(`/admin/tenants/${tenantId}`)
    toast?.('Đã xóa quán.')
    setActiveScreen('tenants')
  }

  if (loading) return <div className="text-slate-400">Đang tải chi tiết...</div>
  if (!data) return <div className="text-red-500">Không tải được chi tiết quán.</div>

  const { tenant, owner, stats } = data

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => setActiveScreen('tenants')} className="text-sm text-emerald-700 font-bold mb-2">Quay lại danh sách</button>
          <h1 className="text-2xl font-black text-slate-900">{tenant.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{tenant.address || 'Chưa có địa chỉ'}</p>
        </div>
        <StatusBadge status={tenant.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Tổng orders" value={stats.totalOrders} />
        <StatCard label="Doanh thu tháng này" value={money(stats.revenueThisMonth)} />
        <StatCard label="Tổng nhân viên" value={stats.totalEmployees} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-soft">
          <h2 className="font-black text-slate-800 mb-4">Thông tin quán</h2>
          <Info label="Slug" value={tenant.slug} />
          <Info label="Loại" value={tenant.type} />
          <Info label="Số bàn" value={tenant.table_count} />
          <Info label="Gói" value={tenant.plan} />
          <Info label="Nguồn đăng ký" value={tenant.registered_by} />
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-soft">
          <h2 className="font-black text-slate-800 mb-4">Thông tin chủ quán</h2>
          <Info label="Tên" value={owner?.name || tenant.owner_name} />
          <Info label="SĐT" value={owner?.phone || tenant.phone} />
          <Info label="Email" value={tenant.owner_email || '-'} />
          <Info label="Tài khoản" value={owner?.is_active ? 'Đang bật' : 'Chưa rõ'} />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-soft">
        <h2 className="font-black text-slate-800 mb-4">Cập nhật vận hành</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
            ['pending', 'Chờ duyệt'],
            ['active', 'Đang hoạt động'],
            ['inactive', 'Tạm khóa'],
          ]} />
          <Select label="Gói" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} options={[
            ['starter', 'starter'],
            ['pro', 'pro'],
            ['business', 'business'],
          ]} />
        </div>
        <label className="block text-sm font-bold text-slate-700 mt-4 mb-1.5">Ghi chú</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400" />
        <div className="flex gap-3 mt-4">
          <button onClick={save} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">Lưu thay đổi</button>
          <button onClick={remove} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100">Xóa quán</button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-700 text-right">{value || '-'}</span>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400">
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </div>
  )
}
