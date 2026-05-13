import { useState } from 'react'

const DEFAULT_TYPES = [
  { value: 'beer',       label: 'Quán nhậu',  emoji: '🍺' },
  { value: 'restaurant', label: 'Nhà hàng',   emoji: '🍽️' },
  { value: 'cafe',       label: 'Café',        emoji: '☕' },
  { value: 'other',      label: 'Khác',        emoji: '🏪' },
]

const STORAGE_KEY = 'staffos_admin_restaurant_types'

function toSlug(label) {
  return label
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `type-${Date.now()}`
}

const EMOJIS = ['🍺','🍽️','☕','🏪','🍜','🍣','🥩','🍕','🥗','🍰','🍹','🎉']

export default function RestaurantTypesPage({ toast }) {
  const [types, setTypes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_TYPES }
    catch { return DEFAULT_TYPES }
  })
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('🏪')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState('')

  const save = (next) => {
    setTypes(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addType = () => {
    const label = newLabel.trim()
    if (!label) { setError('Vui lòng nhập tên loại quán'); return }
    const value = toSlug(label)
    if (types.some((t) => t.value === value || t.label.toLowerCase() === label.toLowerCase())) {
      setError('Loại quán này đã tồn tại')
      return
    }
    save([...types, { value, label, emoji: newEmoji }])
    setNewLabel('')
    setNewEmoji('🏪')
    setError('')
    toast?.(`Đã thêm "${label}"`)
  }

  const startEdit = (type) => {
    setEditingId(type.value)
    setEditForm({ label: type.label, emoji: type.emoji || '🏪' })
    setError('')
  }

  const saveEdit = (value) => {
    const label = editForm.label?.trim()
    if (!label) return
    save(types.map((t) => t.value === value ? { ...t, label, emoji: editForm.emoji } : t))
    setEditingId(null)
    toast?.('Đã cập nhật loại quán')
  }

  const deleteType = (value) => {
    if (!window.confirm('Xóa loại quán này?')) return
    save(types.filter((t) => t.value !== value))
    toast?.('Đã xóa loại quán')
  }

  const resetDefault = () => {
    if (!window.confirm('Khôi phục về danh sách mặc định?')) return
    save(DEFAULT_TYPES)
    toast?.('Đã khôi phục mặc định')
  }

  return (
    <div className="space-y-5 fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Cấu hình</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Loại quán</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý danh sách loại quán dùng khi tạo tenant mới.
          </p>
        </div>
        <button
          onClick={resetDefault}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
          </svg>
          Khôi phục mặc định
        </button>
      </div>

      {/* Stats */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">🏷️</div>
        <div>
          <p className="font-semibold text-emerald-800">{types.length} loại quán</p>
          <p className="text-xs text-emerald-600 mt-0.5">Được dùng trong form tạo quán mới và bộ lọc</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800 text-sm">Danh sách hiện tại</h2>
        </div>

        {types.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-slate-400 text-sm">Chưa có loại quán nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {types.map((type, idx) => (
              <div key={type.value} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                {/* Drag handle (visual only) */}
                <span className="text-slate-200 group-hover:text-slate-300 transition-colors cursor-grab">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/>
                    <circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/>
                    <circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/>
                  </svg>
                </span>

                {/* Emoji */}
                {editingId === type.value ? (
                  <select
                    value={editForm.emoji}
                    onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                    className="w-14 px-1 py-1.5 rounded-lg border border-slate-200 text-center text-lg focus:outline-none focus:border-emerald-400"
                  >
                    {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                ) : (
                  <span className="text-2xl w-8 text-center shrink-0">{type.emoji || '🏪'}</span>
                )}

                {/* Label + slug */}
                <div className="flex-1 min-w-0">
                  {editingId === type.value ? (
                    <input
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(type.value)}
                      autoFocus
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
                    />
                  ) : (
                    <>
                      <p className="font-medium text-slate-800 text-sm">{type.label}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{type.value}</p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {editingId === type.value ? (
                    <>
                      <button
                        onClick={() => saveEdit(type.value)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(type)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Sửa"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteType(type.value)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 text-sm mb-4">Thêm loại quán mới</h2>

        <div className="flex gap-3 items-end">
          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Icon</label>
            <select
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="px-2 py-2.5 rounded-xl border border-slate-200 text-xl text-center focus:outline-none focus:border-emerald-400 bg-slate-50"
            >
              {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Label input */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên loại quán</label>
            <input
              value={newLabel}
              onChange={(e) => { setNewLabel(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && addType()}
              placeholder="VD: Food court, Lẩu nướng..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm transition"
            />
          </div>

          <button
            onClick={addType}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3">
          Slug sẽ được tự động tạo từ tên. Ví dụ: "Food court" → <span className="font-mono">food-court</span>
        </p>
      </div>
    </div>
  )
}
