import { useState } from 'react'
import { Users, CalendarDays, Clock, DollarSign, Plus } from '@/components/ui/Icon'
import EmployeeTable from './components/EmployeeTable'
import WeeklySchedule from './components/WeeklySchedule'
import AttendancePanel from './components/AttendancePanel'
import PayrollPanel from './components/PayrollPanel'

const TABS = [
  { id: 'list',       label: 'Danh sách',  Icon: Users },
  { id: 'schedule',   label: 'Xếp ca',     Icon: CalendarDays },
  { id: 'attendance', label: 'Chấm công',  Icon: Clock },
  { id: 'payroll',    label: 'Tính lương',  Icon: DollarSign },
]

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div className="p-6 lg:p-8 fade-in h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Nhân viên</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý nhân sự, ca làm và lương thưởng</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#10b981' }}
        >
          <Plus size={16} />
          Thêm nhân viên
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map((tab) => {
          const IconComp = tab.Icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'list'       && <EmployeeTable />}
      {activeTab === 'schedule'   && <WeeklySchedule />}
      {activeTab === 'attendance' && <AttendancePanel />}
      {activeTab === 'payroll'    && <PayrollPanel />}
    </div>
  )
}
