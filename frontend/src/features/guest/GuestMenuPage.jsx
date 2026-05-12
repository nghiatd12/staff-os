/**
 * GuestMenuPage — Trang QR Menu cho khách
 * URL: /menu/:slug/ban/:tableId
 * Không cần đăng nhập. Khách quét QR → chọn món → gửi order.
 */
import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN').format(p) + 'đ'
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`)
  return data
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-pulse bg-emerald-500" />
        <p className="text-slate-500 text-sm">Đang tải menu...</p>
      </div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Không tìm thấy</h2>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  )
}

function SuccessScreen({ total, onReset }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order đã gửi!</h2>
        <p className="text-slate-500 text-sm mb-1">Bếp đã nhận được order của bạn.</p>
        <p className="text-emerald-600 font-semibold text-lg mb-6">{formatPrice(total)}</p>
        <p className="text-slate-400 text-xs mb-6">Vui lòng chờ nhân viên mang món ra. Cảm ơn bạn! 🍺</p>
        <button
          onClick={onReset}
          className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-sm active:scale-95 transition-transform"
        >
          Gọi thêm món
        </button>
      </div>
    </div>
  )
}

function CategoryTabs({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            active === cat
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

function MenuItem({ item, qty, onAdd, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
      {/* Icon placeholder */}
      <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-2xl">
        {getCategoryEmoji(item.category)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</p>
        {item.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
        )}
        <p className="text-emerald-600 font-bold text-sm mt-1">{formatPrice(item.price)}</p>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-2 shrink-0">
        {qty > 0 ? (
          <>
            <button
              onClick={() => onRemove(item)}
              className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg active:scale-90 transition-transform"
            >
              −
            </button>
            <span className="w-5 text-center font-bold text-slate-800 text-sm">{qty}</span>
          </>
        ) : null}
        <button
          onClick={() => onAdd(item)}
          className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg active:scale-90 transition-transform shadow-sm"
        >
          +
        </button>
      </div>
    </div>
  )
}

function CartSheet({ items, onChangeQty, onChangeNote, onSubmit, submitting, onClose }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-2 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Giỏ hàng</h3>
          <button onClick={onClose} className="text-slate-400 text-sm">Đóng</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
          {items.map((item) => (
            <div key={item.id} className="border border-slate-100 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-slate-800 text-sm flex-1 mr-2">{item.name}</p>
                <p className="text-emerald-600 font-semibold text-sm shrink-0">
                  {formatPrice(item.price * item.qty)}
                </p>
              </div>

              {/* Qty */}
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => onChangeQty(item.id, -1)}
                  className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-bold active:scale-90 transition-transform"
                >
                  −
                </button>
                <span className="font-bold text-slate-800 text-sm w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => onChangeQty(item.id, 1)}
                  className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold active:scale-90 transition-transform"
                >
                  +
                </button>
                <span className="text-xs text-slate-400 ml-1">{formatPrice(item.price)}/món</span>
              </div>

              {/* Note */}
              <input
                type="text"
                placeholder="Ghi chú (không hành, ít cay...)"
                value={item.note}
                onChange={(e) => onChangeNote(item.id, e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400 placeholder-slate-300"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 font-medium">Tổng cộng</span>
            <span className="text-xl font-bold text-slate-800">{formatPrice(total)}</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
          >
            {submitting ? 'Đang gửi...' : `Gửi order — ${formatPrice(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Emoji helper ────────────────────────────────────────────────────────────

function getCategoryEmoji(category) {
  const map = {
    'Nhậu chính': '🍖',
    'Đồ nhắm': '🥗',
    'Đồ uống': '🍺',
    'Thêm': '🍚',
    'Khai vị': '🥟',
    'Tráng miệng': '🍮',
    'Nước ngọt': '🥤',
  }
  return map[category] || '🍽️'
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GuestMenuPage({ slug, tableId }) {
  const [state, setState] = useState('loading') // loading | error | menu | success
  const [errorMsg, setErrorMsg] = useState('')
  const [data, setData] = useState(null) // { tenant, table, menu, categories }

  const [activeCategory, setActiveCategory] = useState('')
  const [cart, setCart] = useState([]) // [{ id, name, price, qty, note, category }]
  const [showCart, setShowCart] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderTotal, setOrderTotal] = useState(0)

  // Load menu on mount
  useEffect(() => {
    apiFetch(`/public/${slug}/table/${tableId}`)
      .then((res) => {
        setData(res)
        setActiveCategory(res.categories[0] || '')
        setState('menu')
      })
      .catch((err) => {
        setErrorMsg(err.message)
        setState('error')
      })
  }, [slug, tableId])

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, note: '', category: item.category }]
    })
  }, [])

  const removeFromCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (!existing) return prev
      if (existing.qty === 1) return prev.filter((i) => i.id !== item.id)
      return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty - 1 } : i)
    })
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter((i) => i.qty > 0)
    )
  }, [])

  const changeNote = useCallback((id, note) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, note } : i))
  }, [])

  const handleSubmit = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      const items = cart.map((i) => ({
        menuItemId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.qty,
        note: i.note,
      }))
      const res = await apiFetch(`/public/${slug}/orders`, {
        method: 'POST',
        body: JSON.stringify({ tableId: parseInt(tableId), items }),
      })
      setOrderTotal(res.total)
      setCart([])
      setShowCart(false)
      setState('success')
    } catch (err) {
      alert(err.message || 'Gửi order thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setState('menu')
    setCart([])
  }

  // ── Render states ──
  if (state === 'loading') return <LoadingScreen />
  if (state === 'error') return <ErrorScreen message={errorMsg} />
  if (state === 'success') return <SuccessScreen total={orderTotal} onReset={handleReset} />

  const { tenant, table, menu, categories } = data
  const currentItems = menu[activeCategory] || []
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const zoneLabel = table.zone === 'indoor' ? 'Trong nhà' : table.zone === 'outdoor' ? 'Ngoài trời' : 'VIP'

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-emerald-500 text-white px-5 pt-10 pb-5 sticky top-0 z-10 shadow-md">
        <p className="text-emerald-100 text-xs mb-0.5">{zoneLabel} · {tenant.name}</p>
        <h1 className="text-xl font-bold">{table.name}</h1>
        <p className="text-emerald-100 text-xs mt-0.5">Chọn món và bấm Gửi order</p>
      </div>

      {/* Category tabs */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 sticky top-[88px] z-10">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* Menu items */}
      <div className="px-4 pt-4 space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          {getCategoryEmoji(activeCategory)} {activeCategory}
        </h2>
        {currentItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">Không có món trong danh mục này</p>
        ) : (
          currentItems.map((item) => {
            const cartItem = cart.find((i) => i.id === item.id)
            return (
              <MenuItem
                key={item.id}
                item={item}
                qty={cartItem?.qty || 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            )
          })
        )}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base flex items-center justify-between px-5 shadow-xl shadow-emerald-300 active:scale-95 transition-transform"
          >
            <span className="bg-white text-emerald-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
              {cartCount}
            </span>
            <span>Xem giỏ hàng</span>
            <span className="font-semibold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      {showCart && (
        <CartSheet
          items={cart}
          onChangeQty={changeQty}
          onChangeNote={changeNote}
          onSubmit={handleSubmit}
          submitting={submitting}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  )
}
