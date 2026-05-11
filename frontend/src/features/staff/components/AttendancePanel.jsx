import { useState } from 'react'
import { Clock, CheckCircle2, AlertCircle } from '@/components/ui/Icon'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'

const employees = [
  { id: 1, name: 'Nguyễn Văn An',   shift: '08:00-16:00', initials: 'NA', color: 'bg-indigo-500' },
  { id: 2, name: 'Trần Thị Bích',   shift: '16:00-24:00', initials: 'TB', color: 'bg-pink-500'   },
  { id: 3, name: 'Lê Văn Cường',    shift: '08:00-16:00', initials: 'LC', color: 'bg-green-500'  },
  { id: 4, name: 'Phạm Thị Dung',   shift: '16:00-24:00', initials: 'PD', color: 'bg-yellow-500' },
  { id: 5, name: 'Hoàng Văn Em',    shift: '10:00-22:00', initials: 'HE', color: 'bg-red-500'    },
  { id: 6, name: 'Vũ Thị Phương',   shift: '16:00-24:00', initials: 'VP', color: 'bg-purple-500' },
  { id: 7, name: 'Đặng Văn Giang',  shift: '10:00-22:00', initials: 'DG', color: 'bg-teal-500'   },
  { id: 8, name: 'Bùi Thị Hoa',     shift: '08:00-16:00', initials: 'BH', color: 'bg-orange-500' },
]

const ATTENDANCE_DATA = [
  { empId: 1, checkIn: '07:58', checkOut: '16:05', late: 0, status: 'done' },
  { empId: 2, checkIn: '15:55', checkOut: null, late: 0, status: 'working' },
  { empId: 3, checkIn: null, checkOut: null, late: 0, status: 'absent' },
  { empId: 4, checkIn: '16:12', checkOut: null, late: 12, status: 'working' },
  { empId: 5, checkIn: '10:00', checkOut: null, late: 0, status: 'working' },
  { empId: 6, checkIn: '16:03', checkOut: null, late: 3, status: 'working' },
  { empId: 7, checkIn: null, checkOut: null, late: 0, status: 'absent' },
  { empId: 8, checkIn: null, checkOut: null, late: 0, status: 'off' },
]

const STATUS_MAP = {
  done: { label: 'Đã xong ca', color: 'text-slate-400', bg: 'bg-slate-50' },
  working: { label: 'Đang làm', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  absent: { label: 'Vắng mặt', color: 'text-red-600', bg: 'bg-red-50' },
  off: { label: 'Nghỉ phép', color: 'text-blue-600', bg: 'bg-blue-50' },
}

export default function AttendancePanel() {
  const [date] = useState(new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }))

  const working = ATTENDANCE_DATA.filter(a => a.status === 'working').length
  const done = ATTENDANCE_DATA.filter(a => a.status === 'done').length
  const absent = ATTENDANCE_DATA.filter(a => a.status === 'absent').length
  const lateCount = ATTENDANCE_DATA.filter(a => a.late > 0).length

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{working}</p>
          <p className="text-xs text-slate-400 mt-1">Đang làm</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-600">{done}</p>
          <p className="text-xs text-slate-400 mt-1">Đã xong ca</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{absent}</p>
          <p className="text-xs text-slate-400 mt-1">Vắng mặt</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{lateCount}</p>
          <p className="text-xs text-slate-400 mt-1">Đi muộn</p>
        </Card>
      </div>

      {/* Date header */}
      <Card className="mb-4 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{date}</span>
        </div>
        <span className="text-xs text-slate-400">{working + done}/{employees.length} đã check-in</span>
      </Card>

      {/* Attendance list */}
      <Card>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-slate-400 border-b border-slate-100 uppercase tracking-wider">
              <th className="text-left p-4 font-semibold">Nhân viên</th>
              <th className="text-left p-4 font-semibold">Ca làm</th>
              <th className="text-left p-4 font-semibold">Check-in</th>
              <th className="text-left p-4 font-semibold">Check-out</th>
              <th className="text-left p-4 font-semibold">Đi muộn</th>
              <th className="text-left p-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {ATTENDANCE_DATA.map((att) => {
              const emp = employees.find(e => e.id === att.empId)
              if (!emp) return null
              const st = STATUS_MAP[att.status]
              return (
                <tr key={att.empId} className="border-b border-slate-50 table-row-hover">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={emp.initials} colorClass={emp.color} size="sm" />
                      <span className="text-sm font-medium text-slate-700">{emp.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{emp.shift}</td>
                  <td className="p-4">
                    {att.checkIn ? (
                      <span className="text-sm font-medium text-slate-700">{att.checkIn}</span>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {att.checkOut ? (
                      <span className="text-sm font-medium text-slate-700">{att.checkOut}</span>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {att.late > 0 ? (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1 w-fit">
                        <AlertCircle size={12} />
                        {att.late} phút
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
