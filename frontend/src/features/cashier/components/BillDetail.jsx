import { useState } from 'react'
import { formatCurrency } from '@/utils/format'
import { Printer, Banknote, Smartphone, QrCode, Wallet, Check } from '@/components/ui/Icon'
import Card from '@/components/ui/Card'

const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Tiền mặt',     Icon: Banknote },
  { id: 'transfer', label: 'Chuyển khoản', Icon: Wallet },
  { id: 'qr',       label: 'QR VietQR',    Icon: QrCode },
  { id: 'momo',     label: 'MoMo',         Icon: Smartphone },
]

/**
 * BillDetail — chi tiết hóa đơn và thanh toán
 */
export default function BillDetail({ table, orders }) {
  const [discount, setDiscount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')

  const tableOrder = orders.find((o) => o.table_id === table.id)
  const items = tableOrder?.items || []
  const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || i.quantity || 1)), 0)
  const discountAmt = discount ? Math.round(subtotal * (parseFloat(discount) / 100)) : 0
  const total    = subtotal - discountAmt

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Hóa đơn — {table.name}</h2>
          <p className="text-slate-400 text-sm">
            {table.guests} khách · Vào lúc {table.time}
          </p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-2xl text-sm hover:bg-slate-50 transition-colors font-medium">
          <Printer size={16} />
          In hóa đơn
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
        {/* Items table */}
        <Card className="mb-5">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 text-sm">Chi tiết món ăn</h3>
          </div>
          {items.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-slate-400 text-sm">Không có dữ liệu</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  <th className="text-left p-4 font-semibold">Món</th>
                  <th className="text-center p-4 font-semibold">SL</th>
                  <th className="text-right p-4 font-semibold">Đơn giá</th>
                  <th className="text-right p-4 font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 table-row-hover">
                    <td className="p-4 text-sm text-slate-700 font-medium">{item.name}</td>
                    <td className="p-4 text-sm text-center text-slate-500">{item.qty || item.quantity || 1}</td>
                    <td className="p-4 text-sm text-right text-slate-500">{formatCurrency(item.price)}</td>
                    <td className="p-4 text-sm text-right font-bold text-slate-800">
                      {formatCurrency(item.price * (item.qty || item.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Payment */}
        <Card className="p-6">
          <div className="flex justify-between mb-3">
            <span className="text-slate-500 text-sm">Tạm tính</span>
            <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-slate-500 text-sm">Giảm giá (%)</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              min="0"
              max="100"
              className="w-20 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
            />
            {discountAmt > 0 && (
              <span className="text-red-500 text-sm font-medium">-{formatCurrency(discountAmt)}</span>
            )}
          </div>

          <div className="flex justify-between mb-6 pt-4 border-t border-slate-100">
            <span className="font-bold text-slate-800 text-lg">Tổng cộng</span>
            <span className="font-bold text-2xl text-brand-600">{formatCurrency(total)}</span>
          </div>

          <p className="text-sm font-semibold text-slate-700 mb-3">Phương thức thanh toán</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {PAYMENT_METHODS.map((m) => {
              const IconComp = m.Icon
              return (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    payMethod === m.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <IconComp size={24} className={payMethod === m.id ? 'text-brand-600' : 'text-slate-400'} />
                  </div>
                  <div className={`text-xs font-medium ${payMethod === m.id ? 'text-brand-700' : 'text-slate-600'}`}>
                    {m.label}
                  </div>
                </button>
              )
            })}
          </div>

          <button className="w-full bg-brand-500 hover:bg-brand-600 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-soft hover:shadow-card flex items-center justify-center gap-2">
            <Check size={20} strokeWidth={2.5} />
            Thanh toán {formatCurrency(total)}
          </button>
        </Card>
      </div>
    </div>
  )
}
