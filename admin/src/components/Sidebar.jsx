const NAV = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Tổng quan' },
  { id: 'tenants', label: 'Quán hàng', hint: 'Tenant' },
  { id: 'add-tenant', label: 'Thêm quán mới', hint: 'Onboard' },
]

export default function Sidebar({ activeScreen, setActiveScreen, adminEmail, onLogout }) {
  return (
    <aside className="w-72 bg-slate-950 text-white min-h-screen flex flex-col border-r border-slate-900">
      <div className="h-20 px-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/30">
          <span className="w-4 h-4 rounded-full bg-white" />
        </div>
        <div>
          <p className="font-black text-white leading-tight tracking-tight">StaffOS</p>
          <p className="text-xs text-emerald-200/80">Platform Admin</p>
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        <p className="px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Điều hành</p>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`w-full text-left px-4 py-3 rounded-2xl transition-all border ${
              activeScreen === item.id
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-950/30'
                : 'text-slate-300 border-transparent hover:bg-white/8 hover:border-white/10 hover:text-white'
            }`}
          >
            <span className="block text-sm font-black">{item.label}</span>
            <span className={`block text-xs mt-0.5 ${activeScreen === item.id ? 'text-emerald-50' : 'text-slate-500'}`}>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="rounded-2xl bg-white/7 border border-white/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-black mb-2">Admin</p>
          <p className="text-sm font-bold text-white truncate">{adminEmail}</p>
          <p className="text-xs text-slate-500 mt-1">Toàn quyền nền tảng</p>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 w-full px-4 py-3 rounded-2xl bg-white/10 text-slate-200 text-sm font-bold hover:bg-white/15 border border-white/10"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
