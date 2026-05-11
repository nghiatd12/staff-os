import { useState } from 'react'
import { formatCurrency } from '@/utils/format'
import { ShoppingCart, Send, Pencil } from '@/components/ui/Icon'

/**
 * OrderSummary — panel bên phải tóm tắt đơn hàng
 * Mỗi món có thể note riêng
 */
export default function OrderSummary({
  selectedTable,
  orderItems,
  onChangeQty,
  onChangeNote,
  onSubmit,
}) {
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0)
  const [expandedNote, setExpandedNote] = useState(null)

  return (
    <div className="w-80 bg-white border-l border-slate-100 flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Đơn hàng</h2>
            <p className="text-xs text-slate-400 mt-0.5">{selectedTable} · {orderItems.length} món</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <ShoppingCart size={18} className="text-brand-600" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {orderItems.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium">Chưa có món nào</p>
            <p className="text-xs mt-1">Chọn món từ menu bên trái</p>
          </div>
        ) : (
          <div className="space-y-1">
            {orderItems.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                {/* Item row */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{formatCurrency(item.price)}/phần</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onChangeQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-xs font-bold text-slate-500 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-slate-700">{item.qty}</span>
                    <button
                      onClick={() => onChangeQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-20 text-right">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>

                {/* Note per item */}
                <div className="mt-2">
                  {expandedNote === item.id || item.note ? (
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => onChangeNote(item.id, e.target.value)}
                      onFocus={() => setExpandedNote(item.id)}
                      onBlur={() => { if (!item.note) setExpandedNote(null) }}
                      placeholder="Ghi chú: không cay, ít đá..."
                      className="w-full text-xs px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-200"
                    />
                  ) : (
                    <button
                      onClick={() => setExpandedNote(item.id)}
                      className="text-[11px] text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
                    >
                      <Pencil size={10} />
                      Thêm ghi chú
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-500 text-sm">Tạm tính</span>
          <span className="text-lg font-bold text-slate-800">{formatCurrency(subtotal)}</span>
        </div>
        <button
          onClick={onSubmit}
          disabled={orderItems.length === 0}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-2xl font-semibold transition-all shadow-soft hover:shadow-card flex items-center justify-center gap-2"
        >
          <Send size={18} />
          Gửi xuống bếp
        </button>
      </div>
    </div>
  )
}
