import { formatCurrency } from '@/utils/format'

/**
 * MenuGrid — lưới hiển thị các món trong danh mục
 */
export default function MenuGrid({ items, orderItems, onAdd, onChangeQty }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const inOrder = orderItems.find((i) => i.id === item.id)
        return (
          <div
            key={item.id}
            className={`bg-white rounded-3xl border overflow-hidden transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 group ${
              inOrder ? 'border-brand-200 shadow-soft' : 'border-slate-100'
            }`}
          >
            {/* Thumbnail */}
            <div className={`${item.color || 'bg-slate-50'} h-28 flex items-center justify-center relative overflow-hidden`}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              ) : (
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">🍴</span>
              )}
              {inOrder && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {inOrder.qty}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</p>
              <p className="text-brand-600 font-bold text-sm mt-1.5">
                {formatCurrency(item.price)}
              </p>

              <div className="mt-3">
                {inOrder ? (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onChangeQty(item.id, -1)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-slate-800 w-6 text-center">{inOrder.qty}</span>
                    <button
                      onClick={() => onChangeQty(item.id, 1)}
                      className="w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white font-bold transition-colors shadow-soft"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAdd(item)}
                    className="w-full bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-100 hover:border-brand-200"
                  >
                    + Thêm vào đơn
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
