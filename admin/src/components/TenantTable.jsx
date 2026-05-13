import StatusBadge from './StatusBadge'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function TenantTable({ tenants, onView, onStatusChange, onDelete }) {
  return (
    <div className="bg-white border border-white rounded-[22px] shadow-soft ring-1 ring-slate-900/5 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-sm">
        <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-100">
          <tr>
            <th className="text-left px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">Tên quán</th>
            <th className="text-left px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">Chủ quán</th>
            <th className="text-left px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">SĐT</th>
            <th className="text-left px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">Gói</th>
            <th className="text-left px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">Trạng thái</th>
            <th className="text-left px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">Ngày đăng ký</th>
            <th className="text-right px-5 py-4 font-black text-xs uppercase tracking-[0.08em]">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="hover:bg-emerald-50/30 transition-colors">
              <td className="px-5 py-4">
                <p className="font-black text-slate-900">{tenant.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{tenant.slug}</p>
              </td>
              <td className="px-5 py-4 text-slate-600 font-medium">{tenant.owner_user_name || tenant.owner_name || '-'}</td>
              <td className="px-5 py-4 text-slate-500">{tenant.owner_phone || tenant.phone || '-'}</td>
              <td className="px-5 py-4">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase">{tenant.plan || 'starter'}</span>
              </td>
              <td className="px-5 py-4"><StatusBadge status={tenant.status} /></td>
              <td className="px-5 py-4 text-slate-500">{formatDate(tenant.created_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onView(tenant.id)} className="px-3 py-2 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-800">Xem</button>
                  <select
                    value={tenant.status || 'pending'}
                    onChange={(e) => onStatusChange(tenant.id, e.target.value)}
                    className="px-2 py-2 rounded-xl border border-slate-200 text-slate-600 bg-white"
                  >
                    <option value="active">active</option>
                    <option value="pending">pending</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <button onClick={() => onDelete(tenant.id)} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100">Xóa</button>
                </div>
              </td>
            </tr>
          ))}
          {tenants.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-10 text-center text-slate-400">Chưa có quán phù hợp.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
