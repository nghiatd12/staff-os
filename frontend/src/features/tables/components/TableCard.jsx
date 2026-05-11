import { formatCurrency } from '@/utils/format'
import { Armchair, UtensilsCrossed, Hourglass, CalendarCheck, Clock, Users } from '@/components/ui/Icon'

const TABLE_STATUS_CONFIG = {
  empty: {
    label: 'Trống',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-500',
    dot: 'bg-slate-300',
    pulse: false,
  },
  occupied: {
    label: 'Có khách',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  waiting: {
    label: 'Chờ món',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    pulse: true,
  },
  reserved: {
    label: 'Đặt trước',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    pulse: false,
  },
}

const STATUS_ICON = {
  empty: Armchair,
  occupied: UtensilsCrossed,
  waiting: Hourglass,
  reserved: CalendarCheck,
}

export default function TableCard({ table, isSelected, onClick }) {
  const cfg = TABLE_STATUS_CONFIG[table.status]
  const IconComp = STATUS_ICON[table.status]

  return (
    <button
      onClick={onClick}
      className={`${cfg.bg} border ${cfg.border} rounded-3xl p-4 text-left transition-all duration-200 hover:shadow-card relative h-[160px] flex flex-col
        ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-card' : 'hover:-translate-y-0.5'}
        ${cfg.pulse ? 'pulse-live' : ''}`}
    >
      {/* Icon — cố định góc trên trái */}
      <div className="w-8 h-8 rounded-xl bg-white/80 border border-slate-200/50 flex items-center justify-center flex-shrink-0">
        <IconComp size={16} className={cfg.text} />
      </div>

      {/* Status dot — cố định góc trên phải */}
      <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />

      {/* Content */}
      <div className="mt-3 flex-1">
        <p className={`font-bold text-sm ${cfg.text}`}>{table.name}</p>

        {table.status !== 'empty' ? (
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Users size={11} className="text-slate-400" />
              <span className="text-[11px] text-slate-500">{table.guests} khách</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-slate-400" />
              <span className="text-[11px] text-slate-500">{table.time}</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 mt-1.5">Sẵn sàng phục vụ</p>
        )}
      </div>
    </button>
  )
}
