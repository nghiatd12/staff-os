import { useState } from 'react'
import { api } from '@/lib/api'

const DEFAULT_TYPES = [
  { value: 'beer', label: 'Quán nhậu' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'cafe', label: 'Café' },
  { value: 'other', label: 'Khác' },
]

const INIT = {
  restaurantName: '', ownerName: '', ownerPhone: '', ownerPassword: '',
  address: '', type: 'beer', tableCount: 15, plan: 'starter', status: 'pending', notes: '',
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm transition"
      />
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

export default function AddTenantPage({ setActiveScreen, toast }) {
  const [form, setForm] = useState(INIT)
  const [types, setTypes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('staffos_admin_restaurant_types')) || DEFAULT_TYPES }
    catch { return DEFAULT_TYPES }
  })
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [editingType, setEditingType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const change = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/admin/tenants', { ...form, tableCount: Number(form.tableCount) || 1 })
      toast?.('Tạo quán thành công!')
      setActiveScreen('tenants')
    } catch (err) {
      setError(err.message || 'Tạo quán thất bại')
    } finally {
      setLoading(false)
    }
  }

  const saveTypes = (next) => {
    setTypes(next)
    localStorage.setItem('staffos_admin_restaurant_types', JSON.stringify(next))
  }

  const addType = () => {
    const label = newTypeLabel.trim()
    if (!label) return
    const value = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `type-${Date.now()}`
    if (types.some((t) => t.value === value || t.label.toLowerCase() === label.toLowerCase())) {
      setError('Loại quán này đã có.')
      return
    }
    saveTypes([...types, { value, label }])
    setForm((p) => ({ ...p, type: value }))
    setNewTypeLabel('')
    setError('')
  }

  const updateType = () => {
    if (!editingType?.label?.trim()) return
    saveTypes(types.map((t) => t.value === editingType.value ? { ...t, label: editingType.label.trim() } : t))
    setEditingType(null)
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => setActiveScreen('tenants')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </button>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Onboarding</p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thêm quán mới</h1>
        <p className="text-sm text-slate-500 mt-1">Tạo tenant, tài khoản chủ quán và bàn ban đầu.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* Main form */}
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-semibold text-slate-800">Thông tin khởi tạo</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dùng để tạo quán và tài khoản owner đầu tiên.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tên quán *" value={form.restaurantName} onChange={change('restaurantName')} placeholder="Bia Garden Q7" />
            <Field label="Tên chủ quán *" value={form.ownerName} onChange={change('ownerName')} placeholder="Nguyễn Văn A" />
            <Field label="SĐT chủ quán *" value={form.ownerPhone} onChange={change('ownerPhone')} placeholder="0901234567" />
            <Field label="Mật khẩu đăng nhập *" type="password" value={form.ownerPassword} onChange={change('ownerPassword')} placeholder="••••••••" />
            <Field label="Địa chỉ" value={form.address} onChange={change('address')} placeholder="123 Nguyễn Văn Linh, Q7" />
            <Field label="Số bàn" type="number" value={form.tableCount} onChange={change('tableCount')} />
            <Select label="Loại quán" value={form.type} onChange={change('type')} options={types.map((t) => [t.value, t.label])} />
            <Select label="Gói dịch vụ" value={form.plan} onChange={change('plan')} options={[['starter','Starter'],['pro','Pro'],['business','Business']]} />
            <Select label="Trạng thái ban đầu" value={form.status} onChange={change('status')} options={[['pending','Chờ duyệt'],['active','Đang hoạt động'],['inactive','Tạm khóa']]} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú nội bộ</label>
            <textarea
              value={form.notes}
              onChange={change('notes')}
              rows={3}
              placeholder="Ghi chú về quán này..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm resize-none transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setActiveScreen('tenants')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? 'Đang tạo...' : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tạo quán
                </>
              )}
            </button>
          </div>
        </form>

        {/* Type manager */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-fit">
          <h2 className="font-semibold text-slate-800">Loại quán</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">Quản lý danh sách loại quán</p>

          <div className="space-y-2">
            {types.map((type) => (
              <div key={type.value} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                {editingType?.value === type.value ? (
                  <>
                    <input
                      value={editingType.label}
                      onChange={(e) => setEditingType({ ...editingType, label: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
                    />
                    <button type="button" onClick={updateType} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Lưu</button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{type.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{type.value}</p>
                    </div>
                    <button type="button" onClick={() => setEditingType(type)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addType())}
              placeholder="VD: Food court"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
            <button type="button" onClick={addType} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
