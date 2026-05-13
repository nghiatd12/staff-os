import { useState } from 'react'
import { api } from '@/lib/api'
import { setAdminToken } from '@/lib/auth'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl grid lg:grid-cols-[1fr_420px] bg-white rounded-3xl shadow-soft overflow-hidden border border-slate-100">
        <div className="hidden lg:flex flex-col justify-between bg-emerald-600 p-10 text-white">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
              <span className="w-4 h-4 rounded-full bg-white" />
            </div>
            <p className="text-sm font-bold text-emerald-100 uppercase tracking-[0.18em]">Platform Control</p>
            <h1 className="text-4xl font-black mt-4 leading-tight tracking-tight">Quản lý toàn bộ quán StaffOS trong một nơi.</h1>
            <p className="text-emerald-50/90 mt-4 leading-7">Kích hoạt quán, theo dõi trạng thái, tạo tenant thủ công và kiểm soát vận hành nền tảng.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
              <p className="text-2xl font-black">24h</p>
              <p className="text-xs text-slate-400 mt-1">duyệt quán</p>
            </div>
            <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
              <p className="text-2xl font-black">Admin</p>
              <p className="text-xs text-slate-400 mt-1">nội bộ</p>
            </div>
            <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
              <p className="text-2xl font-black">Live</p>
              <p className="text-xs text-slate-400 mt-1">Render API</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">StaffOS Admin</h2>
              <p className="text-sm text-slate-400">Đăng nhập quản trị nền tảng</p>
            </div>
          </div>

          <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email admin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
              placeholder="admin@staffos.vn"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
              placeholder="Nhập mật khẩu"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

        <button
          disabled={loading}
          className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        </form>
      </div>
    </div>
  )
}
