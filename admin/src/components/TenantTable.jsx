import StatusBadge from './StatusBadge'

const PLAN_STYLE = {
  starter:  'bg-slate-100 text-slate-600',
  pro:      'bg-blue-50 text-blue-700',
  business: 'bg-purple-50 text-purple-700',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function TenantTable({ tenants, onView, onStatusChange, onDelete }) {
  if (tenants.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
        <div className="text-4xl mb-3">🏪</div>
        <p className="text-slate-500 font-medium">Chưa có quán nào</p>
        <p className="text-slate-400 text-sm mt-1">Thêm quán mới để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quán</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Chủ quán</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gói</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày tạo</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/60 transition-colors group">
                {/* Quán */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-600">
                      {(tenant.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{tenant.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{tenant.slug}</p>
                    </div>
                  </div>
                </td>

                {/* Chủ quán */}
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">{tenant.owner_user_name || tenant.owner_name || '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{tenant.owner_phone || tenant.phone || ''}</p>
                </td>

                {/* Gói */}
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${PLAN_STYLE[tenant.plan] || PLAN_STYLE.starter}`}>
                    {tenant.plan || 'starter'}
                  </span>
                </td>

                {/* Trạng thái */}
                <td className="px-5 py-4">
                  <StatusBadge status={tenant.status} />
                </td>

                {/* Ngày tạo */}
                <td className="px-5 py-4 text-slate-500 text-sm">{formatDate(tenant.created_at)}</td>

                {/* Thao tác */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(tenant.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <select
                      value={tenant.status || 'pending'}
                      onChange={(e) => onStatusChange(tenant.id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white text-xs focus:outline-none focus:border-emerald-300"
                    >
                      <option value="active">Kích hoạt</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="inactive">Khóa</option>
                    </select>
                    <button
                      onClick={() => onDelete(tenant.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      title="Xóa quán"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
