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
      <form onSubmit={submit} className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-soft">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-emerald-500" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">StaffOS Admin</h1>
            <p className="text-sm text-slate-400">Quản trị nền tảng</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email admin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
              placeholder="admin@staffos.vn"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
              placeholder="Nhập mật khẩu"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

        <button
          disabled={loading}
          className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}
