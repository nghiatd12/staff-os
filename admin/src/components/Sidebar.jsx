const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tenants', label: 'Quán hàng' },
  { id: 'add-tenant', label: 'Thêm quán mới' },
]

export default function Sidebar({ activeScreen, setActiveScreen, adminEmail, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-emerald-500" />
        <div>
          <p className="font-black text-slate-900 leading-tight">StaffOS</p>
          <p className="text-xs text-slate-400">Platform Admin</p>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeScreen === item.id
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 mb-1">Admin</p>
        <p className="text-sm font-bold text-slate-800 truncate">{adminEmail}</p>
        <button
          onClick={onLogout}
          className="mt-3 w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
