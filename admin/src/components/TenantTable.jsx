import StatusBadge from './StatusBadge'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function TenantTable({ tenants, onView, onStatusChange, onDelete }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="text-left px-4 py-3 font-bold">Tên quán</th>
            <th className="text-left px-4 py-3 font-bold">Chủ quán</th>
            <th className="text-left px-4 py-3 font-bold">SĐT</th>
            <th className="text-left px-4 py-3 font-bold">Gói</th>
            <th className="text-left px-4 py-3 font-bold">Trạng thái</th>
            <th className="text-left px-4 py-3 font-bold">Ngày đăng ký</th>
            <th className="text-right px-4 py-3 font-bold">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 font-bold text-slate-800">{tenant.name}</td>
              <td className="px-4 py-3 text-slate-600">{tenant.owner_user_name || tenant.owner_name || '-'}</td>
              <td className="px-4 py-3 text-slate-600">{tenant.owner_phone || tenant.phone || '-'}</td>
              <td className="px-4 py-3 text-slate-600">{tenant.plan || 'starter'}</td>
              <td className="px-4 py-3"><StatusBadge status={tenant.status} /></td>
              <td className="px-4 py-3 text-slate-500">{formatDate(tenant.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onView(tenant.id)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Xem</button>
                  <select
                    value={tenant.status || 'pending'}
                    onChange={(e) => onStatusChange(tenant.id, e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                  >
                    <option value="active">active</option>
                    <option value="pending">pending</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <button onClick={() => onDelete(tenant.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100">Xóa</button>
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
  )
}
