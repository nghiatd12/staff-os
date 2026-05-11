import { formatCurrency } from '@/utils/format'
import { DollarSign, TrendingUp } from '@/components/ui/Icon'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'

const employees = [
  { id: 1, name: 'Nguyễn Văn An',   role: 'Quản lý',   initials: 'NA', color: 'bg-indigo-500' },
  { id: 2, name: 'Trần Thị Bích',   role: 'Phục vụ',   initials: 'TB', color: 'bg-pink-500'   },
  { id: 3, name: 'Lê Văn Cường',    role: 'Phục vụ',   initials: 'LC', color: 'bg-green-500'  },
  { id: 4, name: 'Phạm Thị Dung',   role: 'Thu ngân',  initials: 'PD', color: 'bg-yellow-500' },
  { id: 5, name: 'Hoàng Văn Em',    role: 'Bếp chính', initials: 'HE', color: 'bg-red-500'    },
  { id: 6, name: 'Vũ Thị Phương',   role: 'Phục vụ',   initials: 'VP', color: 'bg-purple-500' },
  { id: 7, name: 'Đặng Văn Giang',  role: 'Bếp phụ',  initials: 'DG', color: 'bg-teal-500'   },
  { id: 8, name: 'Bùi Thị Hoa',     role: 'Phục vụ',   initials: 'BH', color: 'bg-orange-500' },
]

const PAYROLL_DATA = [
  { empId: 1, baseSalary: 12000000, hoursWorked: 176, overtime: 8, bonus: 500000, late: 0, deduction: 0 },
  { empId: 2, baseSalary: 5500000, hoursWorked: 160, overtime: 4, bonus: 200000, late: 2, deduction: 50000 },
  { empId: 3, baseSalary: 5500000, hoursWorked: 128, overtime: 0, bonus: 0, late: 5, deduction: 150000 },
  { empId: 4, baseSalary: 7000000, hoursWorked: 168, overtime: 0, bonus: 300000, late: 1, deduction: 30000 },
  { empId: 5, baseSalary: 9000000, hoursWorked: 192, overtime: 12, bonus: 800000, late: 0, deduction: 0 },
  { empId: 6, baseSalary: 5500000, hoursWorked: 152, overtime: 0, bonus: 100000, late: 3, deduction: 80000 },
  { empId: 7, baseSalary: 7000000, hoursWorked: 160, overtime: 8, bonus: 200000, late: 0, deduction: 0 },
  { empId: 8, baseSalary: 5500000, hoursWorked: 136, overtime: 0, bonus: 0, late: 4, deduction: 120000 },
]

export default function PayrollPanel() {
  const totalSalary = PAYROLL_DATA.reduce((s, p) => s + p.baseSalary + p.bonus - p.deduction, 0)
  const totalBonus = PAYROLL_DATA.reduce((s, p) => s + p.bonus, 0)
  const totalDeduction = PAYROLL_DATA.reduce((s, p) => s + p.deduction, 0)

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Tổng chi lương</p>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalSalary)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Tổng thưởng</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalBonus)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <DollarSign size={20} className="text-red-500" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Tổng khấu trừ</p>
          </div>
          <p className="text-xl font-bold text-red-500">{formatCurrency(totalDeduction)}</p>
        </Card>
      </div>

      {/* Payroll table */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Bảng lương tháng 05/2026</h3>
            <p className="text-xs text-slate-400 mt-0.5">{employees.length} nhân viên</p>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                <th className="text-left p-4 font-semibold">Nhân viên</th>
                <th className="text-right p-4 font-semibold">Lương cơ bản</th>
                <th className="text-right p-4 font-semibold">Giờ làm</th>
                <th className="text-right p-4 font-semibold">OT</th>
                <th className="text-right p-4 font-semibold">Thưởng</th>
                <th className="text-right p-4 font-semibold">Khấu trừ</th>
                <th className="text-right p-4 font-semibold">Thực nhận</th>
              </tr>
            </thead>
            <tbody>
              {PAYROLL_DATA.map((pay) => {
                const emp = employees.find(e => e.id === pay.empId)
                if (!emp) return null
                const netPay = pay.baseSalary + pay.bonus - pay.deduction
                return (
                  <tr key={pay.empId} className="border-b border-slate-50 table-row-hover">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={emp.initials} colorClass={emp.color} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{emp.name}</p>
                          <p className="text-[11px] text-slate-400">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-right text-slate-600">{formatCurrency(pay.baseSalary)}</td>
                    <td className="p-4 text-sm text-right text-slate-600">{pay.hoursWorked}h</td>
                    <td className="p-4 text-sm text-right">
                      {pay.overtime > 0 ? (
                        <span className="text-blue-600 font-medium">+{pay.overtime}h</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right">
                      {pay.bonus > 0 ? (
                        <span className="text-emerald-600 font-medium">+{formatCurrency(pay.bonus)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right">
                      {pay.deduction > 0 ? (
                        <span className="text-red-500 font-medium">-{formatCurrency(pay.deduction)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right font-bold text-slate-800">{formatCurrency(netPay)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
