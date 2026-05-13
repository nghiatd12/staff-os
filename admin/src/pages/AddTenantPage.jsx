import { useState } from 'react'
import { api } from '@/lib/api'

const DEFAULT_RESTAURANT_TYPES = [
  { value: 'beer', label: 'Quán nhậu' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'cafe', label: 'Café' },
  { value: 'other', label: 'Khác' },
]

const INITIAL = {
  restaurantName: '',
  ownerName: '',
  ownerPhone: '',
  ownerPassword: '',
  address: '',
  type: 'beer',
  tableCount: 15,
  plan: 'starter',
  status: 'pending',
  notes: '',
}

export default function AddTenantPage({ setActiveScreen, toast }) {
  const [form, setForm] = useState(INITIAL)
  const [restaurantTypes, setRestaurantTypes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('staffos_admin_restaurant_types')) || DEFAULT_RESTAURANT_TYPES
    } catch {
      return DEFAULT_RESTAURANT_TYPES
    }
  })
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [editingType, setEditingType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const change = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/admin/tenants', {
        ...form,
        tableCount: Number(form.tableCount) || 1,
      })
      toast?.('Tạo quán thành công')
      setActiveScreen('tenants')
    } catch (err) {
      setError(err.message || 'Tạo quán thất bại')
    } finally {
      setLoading(false)
    }
  }

  const saveTypes = (nextTypes) => {
    setRestaurantTypes(nextTypes)
    localStorage.setItem('staffos_admin_restaurant_types', JSON.stringify(nextTypes))
  }

  const addRestaurantType = () => {
    const label = newTypeLabel.trim()
    if (!label) return
    const value = label
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `type-${Date.now()}`
    if (restaurantTypes.some((type) => type.value === value || type.label.toLowerCase() === label.toLowerCase())) {
      setError('Loại quán này đã có trong danh sách.')
      return
    }
    saveTypes([...restaurantTypes, { value, label }])
    setForm((prev) => ({ ...prev, type: value }))
    setNewTypeLabel('')
    setError('')
  }

  const updateRestaurantType = () => {
    if (!editingType?.label?.trim()) return
    const nextTypes = restaurantTypes.map((type) =>
      type.value === editingType.value ? { ...type, label: editingType.label.trim() } : type
    )
    saveTypes(nextTypes)
    setEditingType(null)
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Onboarding</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">Thêm quán mới</h1>
        <p className="text-sm text-slate-500 mt-2">Tạo tenant, tài khoản chủ quán và bàn ban đầu.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
      <form onSubmit={submit} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-soft space-y-5">
        <div>
          <h2 className="font-bold text-slate-800">Thông tin khởi tạo</h2>
          <p className="text-sm text-slate-400 mt-1">Các thông tin này dùng để tạo quán và tài khoản owner đầu tiên.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tên quán" value={form.restaurantName} onChange={change('restaurantName')} />
          <Field label="Tên chủ quán" value={form.ownerName} onChange={change('ownerName')} />
          <Field label="SĐT chủ quán" value={form.ownerPhone} onChange={change('ownerPhone')} />
          <Field label="Mật khẩu đăng nhập" type="password" value={form.ownerPassword} onChange={change('ownerPassword')} />
          <Field label="Địa chỉ" value={form.address} onChange={change('address')} />
          <Field label="Số bàn" type="number" value={form.tableCount} onChange={change('tableCount')} />
          <Select label="Loại quán" value={form.type} onChange={change('type')} options={restaurantTypes.map((type) => [type.value, type.label])} />
          <Select label="Gói" value={form.plan} onChange={change('plan')} options={[
            ['starter', 'starter'],
            ['pro', 'pro'],
            ['business', 'business'],
          ]} />
          <Select label="Trạng thái" value={form.status} onChange={change('status')} options={[
            ['pending', 'Chờ duyệt'],
            ['active', 'Đang hoạt động'],
            ['inactive', 'Tạm khóa'],
          ]} />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú</label>
          <textarea value={form.notes} onChange={change('notes')} rows={4} className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => setActiveScreen('tenants')} className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-sm font-medium">Hủy</button>
          <button disabled={loading} className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
            {loading ? 'Đang tạo...' : 'Tạo quán'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-soft h-fit">
        <h2 className="font-bold text-slate-800">Loại quán</h2>
        <p className="text-sm text-slate-400 mt-1">Quản lý danh sách loại quán dùng trong form tạo tenant.</p>
        <div className="mt-4 space-y-2">
          {restaurantTypes.map((type) => (
            <div key={type.value} className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50">
              {editingType?.value === type.value ? (
                <>
                  <input
                    value={editingType.label}
                    onChange={(e) => setEditingType({ ...editingType, label: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-300"
                  />
                  <button type="button" onClick={updateRestaurantType} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Lưu</button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{type.label}</p>
                    <p className="text-[11px] text-slate-400">{type.value}</p>
                  </div>
                  <button type="button" onClick={() => setEditingType(type)} className="px-3 py-2 rounded-xl bg-white text-slate-500 text-xs font-bold border border-slate-200">Sửa</button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={newTypeLabel}
            onChange={(e) => setNewTypeLabel(e.target.value)}
            placeholder="VD: Food court"
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
          />
          <button type="button" onClick={addRestaurantType} className="px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">Thêm</button>
        </div>
      </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300">
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </div>
  )
}
