import { formatCurrency } from '@/utils/format'
import { Clock, Users } from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'

/**
 * TableList — danh sách bàn có hóa đơn (panel trái)
 */
export default function TableList({ tables, orders, selectedId, onSelect }) {
  return (
    <div className="w-72 bg-white border-r border-slate-100 flex flex-col">
      <div className="p-5 border-b border-slate-100 flex-shrink-0">
        <h2 className="font-bold text-slate-800">Thu ngân</h2>
        <p className="text-xs text-slate-400 mt-0.5">{tables.length} bàn có hóa đơn</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tables.length === 0 ? (
          <div className="p-5 text-center">
            <p className="text-slate-400 text-sm">Không có dữ liệu</p>
          </div>
        ) : (
          tables.map((table) => {
            // Gộp tất cả orders của bàn để tính tổng
            const tableOrders = orders.filter((o) => o.table_id === table.id)
            const allItems = tableOrders.flatMap((o) => o.items || [])
            const total = allItems.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0)
            const isSelected = selectedId === table.id

            return (
              <button
                key={table.id}
                onClick={() => onSelect(table)}
                className={`w-full p-4 text-left border-b border-slate-50 transition-all
                  ${isSelected
                    ? 'bg-brand-50 border-l-[3px] border-l-brand-500'
                    : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">{table.name}</span>
                  <Badge variant={table.status === 'occupied' ? 'success' : 'warning'} dot>
                    {table.status === 'occupied' ? 'Có khách' : 'Chờ món'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {table.guests} khách
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {table.time}
                  </span>
                </div>
                {total > 0 && (
                  <div className="text-sm font-bold text-brand-600 mt-2">
                    {formatCurrency(total)}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
