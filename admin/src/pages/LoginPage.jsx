import { useState } from 'react'
import { api } from '@/lib/api'
import { setAdminToken } from '@/lib/auth'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/admin/login', { email, password })
      setAdminToken(data.token)
      onLogin(data.admin)
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-5">
      <div className="w-full max-w-[900px] grid lg:grid-cols-[1fr_400px] rounded-3xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between bg-emerald-600 p-10 text-white">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-white">StaffOS</p>
                <p className="text-xs text-emerald-200">Platform Admin</p>
              </div>
            </div>

            <h1 className="text-3xl font-bold leading-snug tracking-tight mb-4">
              Quản lý toàn bộ quán<br/>trong một nơi.
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Kích hoạt quán, theo dõi trạng thái, tạo tenant thủ công và kiểm soát vận hành nền tảng.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { v: '24h', l: 'Duyệt quán' },
              { v: 'SaaS', l: 'Multi-tenant' },
              { v: 'Live', l: 'Realtime API' },
            ].map((item) => (
              <div key={item.v} className="rounded-2xl bg-white/10 border border-white/15 p-4">
                <p className="text-xl font-bold">{item.v}</p>
                <p className="text-xs text-emerald-200 mt-1">{item.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Đăng nhập Admin</h2>
            <p className="text-sm text-slate-400 mt-1">Chỉ dành cho quản trị viên nền tảng</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email admin</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@staffos.vn"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
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

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
