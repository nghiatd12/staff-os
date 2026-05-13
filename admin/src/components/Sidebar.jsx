const NAV = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Tổng quan' },
  { id: 'tenants', label: 'Quán hàng', hint: 'Tenant' },
  { id: 'add-tenant', label: 'Thêm quán mới', hint: 'Onboard' },
]

export default function Sidebar({ activeScreen, setActiveScreen, adminEmail, onLogout }) {
  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-slate-100">
      <div className="h-[72px] px-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
          <span className="w-3.5 h-3.5 rounded-full bg-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 leading-tight tracking-tight">StaffOS</p>
          <p className="text-[10px] text-slate-400 font-medium">Platform Admin</p>
        </div>
      </div>

      <nav className="p-3 py-4 space-y-1 flex-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all relative ${
              activeScreen === item.id
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {activeScreen === item.id && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-emerald-500" />
            )}
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className={`block text-[10px] mt-0.5 ${activeScreen === item.id ? 'text-emerald-600' : 'text-slate-400'}`}>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Admin</p>
          <p className="text-sm font-semibold text-slate-700 truncate">{adminEmail}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Toàn quyền nền tảng</p>
        </div>
        <button
          onClick={onLogout}
          className="mt-2 w-full px-3 py-2 rounded-xl text-left text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
