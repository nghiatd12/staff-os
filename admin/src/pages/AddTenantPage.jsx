import { useState } from 'react'
import { api } from '@/lib/api'

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

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <p className="text-sm font-black text-emerald-700 uppercase tracking-[0.16em]">Onboarding</p>
        <h1 className="text-3xl font-black text-slate-950 mt-1 tracking-tight">Thêm quán mới</h1>
        <p className="text-sm text-slate-500 mt-2">Tạo tenant, tài khoản chủ quán và bàn ban đầu.</p>
      </div>

      <form onSubmit={submit} className="bg-white border border-white rounded-[24px] p-6 shadow-soft ring-1 ring-slate-900/5 space-y-5">
        <div>
          <h2 className="font-black text-slate-900">Thông tin khởi tạo</h2>
          <p className="text-sm text-slate-400 mt-1">Các thông tin này dùng để tạo quán và tài khoản owner đầu tiên.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tên quán" value={form.restaurantName} onChange={change('restaurantName')} />
          <Field label="Tên chủ quán" value={form.ownerName} onChange={change('ownerName')} />
          <Field label="SĐT chủ quán" value={form.ownerPhone} onChange={change('ownerPhone')} />
          <Field label="Mật khẩu đăng nhập" type="password" value={form.ownerPassword} onChange={change('ownerPassword')} />
          <Field label="Địa chỉ" value={form.address} onChange={change('address')} />
          <Field label="Số bàn" type="number" value={form.tableCount} onChange={change('tableCount')} />
          <Select label="Loại" value={form.type} onChange={change('type')} options={[
            ['beer', 'Quán nhậu'],
            ['restaurant', 'Nhà hàng'],
            ['other', 'Khác'],
          ]} />
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
          <textarea value={form.notes} onChange={change('notes')} rows={4} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => setActiveScreen('tenants')} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold">Hủy</button>
          <button disabled={loading} className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 disabled:opacity-60 shadow-lg shadow-emerald-900/15">
            {loading ? 'Đang tạo...' : 'Tạo quán'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400" />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400">
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </div>
  )
}
