import { MoreHorizontal } from '@/components/ui/Icon'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'

const ROLE_COLORS = {
  'Quản lý':   'bg-purple-100 text-purple-700',
  'Phục vụ':   'bg-blue-100   text-blue-700',
  'Thu ngân':  'bg-green-100  text-green-700',
  'Bếp chính': 'bg-red-100    text-red-700',
  'Bếp phụ':  'bg-orange-100 text-orange-700',
}

const employees = [
  { id: 1, name: 'Nguyễn Văn An',   role: 'Quản lý',   phone: '0901234567', shift: '08:00-16:00', status: 'online',  initials: 'NA', color: 'bg-indigo-500' },
  { id: 2, name: 'Trần Thị Bích',   role: 'Phục vụ',   phone: '0912345678', shift: '16:00-24:00', status: 'online',  initials: 'TB', color: 'bg-pink-500'   },
  { id: 3, name: 'Lê Văn Cường',    role: 'Phục vụ',   phone: '0923456789', shift: '08:00-16:00', status: 'offline', initials: 'LC', color: 'bg-green-500'  },
  { id: 4, name: 'Phạm Thị Dung',   role: 'Thu ngân',  phone: '0934567890', shift: '16:00-24:00', status: 'online',  initials: 'PD', color: 'bg-yellow-500' },
  { id: 5, name: 'Hoàng Văn Em',    role: 'Bếp chính', phone: '0945678901', shift: '10:00-22:00', status: 'online',  initials: 'HE', color: 'bg-red-500'    },
  { id: 6, name: 'Vũ Thị Phương',   role: 'Phục vụ',   phone: '0956789012', shift: '16:00-24:00', status: 'online',  initials: 'VP', color: 'bg-purple-500' },
  { id: 7, name: 'Đặng Văn Giang',  role: 'Bếp phụ',  phone: '0967890123', shift: '10:00-22:00', status: 'offline', initials: 'DG', color: 'bg-teal-500'   },
  { id: 8, name: 'Bùi Thị Hoa',     role: 'Phục vụ',   phone: '0978901234', shift: '08:00-16:00', status: 'offline', initials: 'BH', color: 'bg-orange-500' },
]

export default function EmployeeTable() {
  return (
    <Card>
      <table className="w-full">
        <thead>
          <tr className="text-[11px] text-slate-400 border-b border-slate-100 uppercase tracking-wider">
            <th className="text-left p-4 font-semibold">Nhân viên</th>
            <th className="text-left p-4 font-semibold">Chức vụ</th>
            <th className="text-left p-4 font-semibold">Số điện thoại</th>
            <th className="text-left p-4 font-semibold">Ca hôm nay</th>
            <th className="text-left p-4 font-semibold">Trạng thái</th>
            <th className="text-center p-4 font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-b border-slate-50 table-row-hover">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={emp.initials} colorClass={emp.color} size="sm" />
                  <span className="font-medium text-slate-700 text-sm">{emp.name}</span>
                </div>
              </td>
              <td className="p-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${ROLE_COLORS[emp.role] ?? 'bg-slate-100 text-slate-600'}`}>
                  {emp.role}
                </span>
              </td>
              <td className="p-4 text-sm text-slate-500">{emp.phone}</td>
              <td className="p-4 text-sm text-slate-500">{emp.shift}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${emp.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={`text-xs font-medium ${emp.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {emp.status === 'online' ? 'Đang làm' : 'Nghỉ'}
                  </span>
                </div>
              </td>
              <td className="p-4 text-center">
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
