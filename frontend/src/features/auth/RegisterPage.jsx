import { useState } from 'react'
import Card from '@/components/ui/Card'
import { Store, ChevronRight, ChevronLeft, Check } from '@/components/ui/Icon'
import { api } from '@/lib/api'

const STEPS = [
  { id: 1, label: 'Tài khoản chủ quán' },
  { id: 2, label: 'Thông tin quán' },
  { id: 3, label: 'Xác nhận' },
]

const RESTAURANT_TYPES = [
  { id: 'beer',       label: 'Quán nhậu' },
  { id: 'restaurant', label: 'Nhà hàng' },
  { id: 'beerclub',   label: 'Beer Club' },
  { id: 'cafe',       label: 'Café' },
]

export default function RegisterPage({ onNavigate }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    address: '',
    tableCount: '',
    type: 'beer',
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 3))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/register', {
        name: form.name,
        phone: form.phone,
        password: form.password,
        restaurantName: form.restaurantName,
        address: form.address,
        tableCount: Number(form.tableCount) || 10,
        type: form.type,
      })
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      onNavigate?.('login')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#10b981' }}
          >
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Đăng ký quán mới</h1>
          <p className="text-sm text-slate-400 mt-1">Tạo tài khoản chủ quán + thiết lập quán</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s.id ? 'text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                  style={step >= s.id ? { backgroundColor: '#10b981' } : undefined}
                >
                  {step > s.id ? <Check size={14} /> : s.id}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${step >= s.id ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Tài khoản chủ quán */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
                  ℹ️ Đây là tài khoản <strong>chủ quán</strong> — có toàn quyền quản lý. Nhân viên sẽ được thêm sau trong mục "Nhân viên".
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên chủ quán</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại (dùng để đăng nhập)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="0901 234 567"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={handleChange('password')}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Thông tin quán */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên quán</label>
                  <input
                    type="text"
                    value={form.restaurantName}
                    onChange={handleChange('restaurantName')}
                    placeholder="Bia Garden Quận 7"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange('address')}
                    placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Số bàn ban đầu</label>
                  <input
                    type="number"
                    value={form.tableCount}
                    onChange={handleChange('tableCount')}
                    placeholder="15"
                    min="1"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại hình kinh doanh</label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESTAURANT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, type: type.id }))}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          form.type === type.id
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Xác nhận */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Xác nhận thông tin</h3>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-sm">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Chủ quán</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Họ tên</span>
                    <span className="font-medium text-slate-700">{form.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Điện thoại</span>
                    <span className="font-medium text-slate-700">{form.phone || '—'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-sm">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quán</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tên quán</span>
                    <span className="font-medium text-slate-700">{form.restaurantName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa chỉ</span>
                    <span className="font-medium text-slate-700">{form.address || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số bàn</span>
                    <span className="font-medium text-slate-700">{form.tableCount || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loại hình</span>
                    <span className="font-medium text-slate-700">
                      {RESTAURANT_TYPES.find((t) => t.id === form.type)?.label || '—'}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 text-xs text-emerald-700">
                  <p className="font-semibold mb-1">✅ Sau khi đăng ký:</p>
                  <ul className="space-y-0.5 text-emerald-600">
                    <li>• Bạn sẽ là <strong>Chủ quán</strong> — toàn quyền quản lý</li>
                    <li>• Thêm nhân viên trong mục "Nhân viên" → cấp SĐT + mã PIN</li>
                    <li>• Nhân viên đăng nhập bằng SĐT + mã PIN với vai trò tương ứng</li>
                  </ul>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft size={16} />
                  Quay lại
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#10b981' }}
                >
                  Tiếp theo
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#10b981' }}
                >
                  {loading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                  {!loading && <Check size={16} />}
                </button>
              )}
            </div>
          </form>

          {/* Back to login */}
          <p className="text-sm text-slate-400 text-center mt-5">
            Đã có tài khoản?{' '}
            <button
              onClick={() => onNavigate?.('login')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Đăng nhập
            </button>
          </p>
        </Card>
      </div>
    </div>
  )
}
