import Avatar from '@/components/ui/Avatar'

const employees = [
  { id: 1, name: 'Nguyễn Văn An',   initials: 'NA', color: 'bg-indigo-500' },
  { id: 2, name: 'Trần Thị Bích',   initials: 'TB', color: 'bg-pink-500'   },
  { id: 3, name: 'Lê Văn Cường',    initials: 'LC', color: 'bg-green-500'  },
  { id: 4, name: 'Phạm Thị Dung',   initials: 'PD', color: 'bg-yellow-500' },
  { id: 5, name: 'Hoàng Văn Em',    initials: 'HE', color: 'bg-red-500'    },
  { id: 6, name: 'Vũ Thị Phương',   initials: 'VP', color: 'bg-purple-500' },
  { id: 7, name: 'Đặng Văn Giang',  initials: 'DG', color: 'bg-teal-500'   },
  { id: 8, name: 'Bùi Thị Hoa',     initials: 'BH', color: 'bg-orange-500' },
]

const weeklyShifts = {
  1: ['08-16', '08-16', '08-16', '',      '08-16', '',      ''     ],
  2: ['',      '16-24', '16-24', '16-24', '',      '16-24', '16-24'],
  3: ['08-16', '',      '08-16', '08-16', '',      '',      '08-16'],
  4: ['',      '16-24', '',      '16-24', '16-24', '16-24', ''     ],
  5: ['10-22', '10-22', '',      '10-22', '10-22', '10-22', ''     ],
  6: ['',      '',      '16-24', '',      '16-24', '16-24', '16-24'],
  7: ['10-22', '',      '10-22', '',      '10-22', '',      '10-22'],
  8: ['08-16', '08-16', '',      '',      '08-16', '08-16', ''     ],
}

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function WeeklySchedule() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-700">Lịch ca tuần này (13/01 – 19/01)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-3 text-sm font-medium text-slate-600 w-40">Nhân viên</th>
              {DAYS.map((d) => (
                <th key={d} className="p-3 text-sm font-medium text-slate-600 text-center w-24">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-slate-100">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar initials={emp.initials} colorClass={emp.color} size="sm" />
                    <span className="text-sm text-slate-700">
                      {emp.name.split(' ').slice(-2).join(' ')}
                    </span>
                  </div>
                </td>
                {DAYS.map((_, di) => {
                  const shift = weeklyShifts[emp.id]?.[di] ?? ''
                  return (
                    <td key={di} className="p-2 text-center">
                      {shift ? (
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md font-medium">
                          {shift}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
