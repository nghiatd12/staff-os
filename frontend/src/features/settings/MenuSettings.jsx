import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { fetchMenu } from '@/lib/store'
import {
  CheckCircle2, Download, Pencil, Plus, Save, Trash2, Upload, X, Layers, FolderOpen,
} from '@/components/ui/Icon'

// ─── Constants ────────────────────────────────────────────────────────────────

const MENU_TYPES = [
  { value: 'regular',  label: 'Ngày thường' },
  { value: 'holiday',  label: 'Ngày lễ' },
  { value: 'seasonal', label: 'Theo mùa' },
  { value: 'event',    label: 'Sự kiện' },
]

const EMPTY_ITEM = { name: '', category: '', price: '', description: '', available: true }

function formatPrice(v) {
  return new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + 'đ'
}

// ─── Excel helpers ────────────────────────────────────────────────────────────

function normalizeKey(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key]
  }
  return ''
}

function parseAvailable(value) {
  if (value === undefined || value === null || value === '') return true
  const text = String(value).trim().toLowerCase()
  return !['false', '0', 'không', 'khong', 'ngưng', 'ngung', 'off', 'no'].includes(text)
}

function parsePrice(value) {
  if (typeof value === 'number') return value
  return Number(String(value || '').replace(/[^\d]/g, '') || 0)
}

function parseWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx')
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
        resolve(rows.map((row) => ({
          name:        String(normalizeKey(row, ['Tên món', 'Ten mon', 'name', 'Name'])).trim(),
          category:    String(normalizeKey(row, ['Danh mục', 'Danh muc', 'category', 'Category'])).trim(),
          price:       parsePrice(normalizeKey(row, ['Giá', 'Gia', 'price', 'Price'])),
          description: String(normalizeKey(row, ['Mô tả', 'Mo ta', 'description', 'Description'])).trim(),
          available:   parseAvailable(normalizeKey(row, ['Đang bán', 'Dang ban', 'available', 'Available'])),
        })).filter((item) => item.name || item.category || item.price))
      } catch (err) { reject(err) }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SetCard({ set, active, onClick, onActivate }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
        active
          ? 'border-emerald-300 bg-emerald-50/60 ring-1 ring-emerald-200'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen size={14} className={active ? 'text-emerald-600 shrink-0' : 'text-slate-400 shrink-0'} />
          <p className={`text-sm font-semibold truncate ${active ? 'text-emerald-800' : 'text-slate-700'}`}>
            {set.name}
          </p>
        </div>
        {set.is_active
          ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shrink-0">Live</span>
          : <span
              onClick={(e) => { e.stopPropagation(); onActivate(set.id) }}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors shrink-0"
            >
              Kích hoạt
            </span>
        }
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
        <span>{MENU_TYPES.find((t) => t.value === set.type)?.label || set.type}</span>
        <span>·</span>
        <span>{set.available_count ?? 0}/{set.item_count ?? 0} món</span>
      </div>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MenuSettings() {
  const [sets, setSets] = useState([])
  const [selectedSetId, setSelectedSetId] = useState(null)
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [newItem, setNewItem] = useState(EMPTY_ITEM)
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItem, setEditingItem] = useState(EMPTY_ITEM)
  const [customCategories, setCustomCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('staffos_menu_categories')) || [] }
    catch { return [] }
  })
  const [newCategory, setNewCategory] = useState('')
  const [importMode, setImportMode] = useState('append')
  const [showNewSet, setShowNewSet] = useState(false)
  const [newSet, setNewSet] = useState({ name: '', type: 'regular', description: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  const selectedSet = sets.find((s) => s.id === selectedSetId)
  const categories = useMemo(
    () => [...new Set([...items.map((i) => i.category), ...customCategories].filter(Boolean))],
    [items, customCategories]
  )
  const filteredItems = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)

  const toast = (msg) => { setStatus(msg); setTimeout(() => setStatus(''), 2500) }

  const loadSets = async () => {
    const data = await api.get('/menu/sets')
    setSets(data.sets || [])
    setSelectedSetId((cur) => cur || data.sets?.[0]?.id || null)
  }

  const loadItems = async (setId) => {
    if (!setId) { setItems([]); return }
    const data = await api.get(`/menu/sets/${setId}/items`)
    setItems(data.items || [])
  }

  useEffect(() => {
    setLoading(true)
    loadSets().catch((e) => toast(e.message)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadItems(selectedSetId).catch((e) => toast(e.message)) }, [selectedSetId])

  const refresh = async (setId = selectedSetId) => {
    await loadSets(); await loadItems(setId); await fetchMenu()
  }

  const saveCategories = (next) => {
    setCustomCategories(next)
    localStorage.setItem('staffos_menu_categories', JSON.stringify(next))
  }

  const handleAddCategory = () => {
    const cat = newCategory.trim()
    if (!cat) return
    if (categories.some((c) => c.toLowerCase() === cat.toLowerCase())) { toast('Danh mục đã có.'); return }
    saveCategories([...customCategories, cat])
    setNewItem((p) => ({ ...p, category: cat }))
    setNewCategory('')
    toast('Đã thêm danh mục.')
  }

  const handleCreateSet = async () => {
    if (!newSet.name.trim()) { toast('Nhập tên bộ menu.'); return }
    const data = await api.post('/menu/sets', newSet)
    setNewSet({ name: '', type: 'regular', description: '' })
    setShowNewSet(false)
    setSelectedSetId(data.set.id)
    await refresh(data.set.id)
    toast('Đã tạo bộ menu.')
  }

  const handleActivateSet = async (setId) => {
    await api.post(`/menu/sets/${setId}/activate`, {})
    setSelectedSetId(setId)
    await refresh(setId)
    toast('Đã kích hoạt menu.')
  }

  const handleAddItem = async () => {
    if (!selectedSetId) { toast('Chọn bộ menu trước.'); return }
    if (!newItem.name || !newItem.category || !newItem.price) { toast('Nhập đủ tên, danh mục và giá.'); return }
    await api.post(`/menu/sets/${selectedSetId}/items`, { ...newItem, price: Number(newItem.price) })
    setNewItem(EMPTY_ITEM)
    await refresh()
    toast('Đã thêm món.')
  }

  const handleSaveItem = async () => {
    await api.patch(`/menu/${editingItemId}`, { ...editingItem, price: Number(editingItem.price) })
    setEditingItemId(null)
    await refresh()
    toast('Đã lưu.')
  }

  const handleToggle = async (item) => {
    await api.patch(`/menu/${item.id}`, { available: !item.available })
    await refresh()
  }

  const handleDownloadTemplate = () => {
    import('xlsx').then((XLSX) => {
      const rows = [
        { 'Tên món': 'Gỏi cuốn', 'Danh mục': 'Đồ nhắm', 'Giá': 65000, 'Mô tả': 'Rau tươi, tôm thịt', 'Đang bán': 'Có' },
        { 'Tên món': 'Bia Tiger', 'Danh mục': 'Đồ uống', 'Giá': 30000, 'Mô tả': 'Lon/chai', 'Đang bán': 'Có' },
        { 'Tên món': 'Lẩu Thái', 'Danh mục': 'Nhậu chính', 'Giá': 280000, 'Mô tả': 'Size vừa', 'Đang bán': 'Có' },
      ]
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Menu')
      XLSX.writeFile(wb, 'staffos-menu-mau.xlsx')
    }).catch(() => toast('Lỗi tạo file Excel.'))
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !selectedSetId) return
    try {
      const parsed = await parseWorkbook(file)
      const data = await api.post(`/menu/sets/${selectedSetId}/import`, { mode: importMode, items: parsed })
      await refresh()
      toast(`Đã import ${data.insertedCount} món${data.skippedCount ? `, bỏ qua ${data.skippedCount}` : ''}.`)
    } catch (err) { toast(err.message || 'Import thất bại.') }
  }

  const inputCls = 'border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white'

  return (
    <div className="h-full flex flex-col gap-4">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="font-bold text-slate-800">Quản lý menu</h2>
          <p className="text-xs text-slate-400 mt-0.5">Bộ menu · Danh mục · Món ăn</p>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
              ✓ {status}
            </span>
          )}
        </div>
      </div>

      {/* ── Main layout: 3 cột ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Cột 1: Bộ menu ── */}
        <div className="w-52 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bộ menu</p>
            <button
              onClick={() => setShowNewSet((v) => !v)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
              title="Tạo bộ menu mới"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Form tạo bộ menu mới */}
          {showNewSet && (
            <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2">
              <input
                value={newSet.name}
                onChange={(e) => setNewSet({ ...newSet, name: e.target.value })}
                placeholder="Tên bộ menu"
                className={inputCls + ' w-full'}
              />
              <select
                value={newSet.type}
                onChange={(e) => setNewSet({ ...newSet, type: e.target.value })}
                className={inputCls + ' w-full'}
              >
                {MENU_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="flex gap-1.5">
                <button onClick={handleCreateSet} className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">Tạo</button>
                <button onClick={() => setShowNewSet(false)} className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs hover:bg-slate-200">Hủy</button>
              </div>
            </div>
          )}

          {/* Danh sách bộ menu */}
          <div className="flex-1 overflow-y-auto space-y-1.5">
            {loading && <p className="text-xs text-slate-400 px-1">Đang tải...</p>}
            {sets.map((set) => (
              <SetCard
                key={set.id}
                set={set}
                active={selectedSetId === set.id}
                onClick={() => setSelectedSetId(set.id)}
                onActivate={handleActivateSet}
              />
            ))}
            {!loading && sets.length === 0 && (
              <p className="text-xs text-slate-400 px-1">Chưa có bộ menu. Bấm + để tạo.</p>
            )}
          </div>
        </div>

        {/* ── Cột 2: Danh mục + Thêm món ── */}
        <div className="w-56 shrink-0 flex flex-col gap-3">
          {/* Danh mục */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Danh mục</p>
            <div className="flex gap-1.5 mb-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Thêm danh mục..."
                className={inputCls + ' flex-1 min-w-0'}
              />
              <button onClick={handleAddCategory} className="px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100">+</button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${
                  activeCategory === 'all' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Tất cả</span>
                <span className="text-xs text-slate-400">{items.length}</span>
              </button>
              {categories.map((cat) => {
                const count = items.filter((i) => i.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between group ${
                      activeCategory === cat ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-xs text-slate-400 shrink-0">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Thêm món */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Thêm món</p>
            <div className="space-y-2">
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Tên món *"
                className={inputCls + ' w-full'}
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className={inputCls + ' w-full'}
              >
                <option value="">Chọn danh mục *</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Giá (đ) *"
                className={inputCls + ' w-full'}
              />
              <input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Mô tả (tuỳ chọn)"
                className={inputCls + ' w-full'}
              />
              <button
                onClick={handleAddItem}
                disabled={!selectedSetId}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Plus size={14} />
                Thêm món
              </button>
            </div>
          </div>
        </div>

        {/* ── Cột 3: Danh sách món ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-700">
                {selectedSet?.name || 'Chọn bộ menu'}
              </p>
              <span className="text-xs text-slate-400">
                {filteredItems.length} món{activeCategory !== 'all' ? ` · ${activeCategory}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value)}
                className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
              >
                <option value="append">Import thêm</option>
                <option value="replace">Thay thế</option>
              </select>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                <Download size={13} />
                Excel mẫu
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedSetId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Upload size={13} />
                Import
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <p className="text-3xl mb-3">🍽️</p>
                <p className="text-slate-500 font-medium text-sm">
                  {selectedSetId ? 'Chưa có món nào' : 'Chọn bộ menu để xem'}
                </p>
                <p className="text-slate-400 text-xs mt-1">Thêm món thủ công hoặc import Excel</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm">
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên món</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh mục</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Giá</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item) => {
                    const editing = editingItemId === item.id
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                        {editing ? (
                          <>
                            <td className="px-4 py-2.5">
                              <input
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                className={inputCls + ' w-full'}
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <select
                                value={editingItem.category}
                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                className={inputCls + ' w-full'}
                              >
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                className={inputCls + ' w-28 text-right'}
                              />
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <label className="flex items-center justify-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingItem.available}
                                  onChange={(e) => setEditingItem({ ...editingItem, available: e.target.checked })}
                                  className="accent-emerald-600"
                                />
                                <span className="text-xs text-slate-500">Bán</span>
                              </label>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1 justify-end">
                                <button onClick={handleSaveItem} className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                                  <Save size={13} />
                                </button>
                                <button onClick={() => setEditingItemId(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                                  <X size={13} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800 leading-tight">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{item.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                              {formatPrice(item.price)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleToggle(item)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                  item.available
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                {item.available ? 'Đang bán' : 'Ẩn'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => { setEditingItemId(item.id); setEditingItem({ name: item.name, category: item.category, price: item.price, description: item.description || '', available: item.available }) }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
