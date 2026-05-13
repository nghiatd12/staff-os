import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { fetchMenu } from '@/lib/store'
import Card from '@/components/ui/Card'
import {
  CheckCircle2, Download, FileSpreadsheet, FolderOpen, Layers, Pencil, Plus, Save, Upload, X,
} from '@/components/ui/Icon'

const MENU_TYPES = [
  { value: 'regular', label: 'Menu ngày thường' },
  { value: 'holiday', label: 'Menu ngày lễ' },
  { value: 'seasonal', label: 'Menu theo mùa' },
  { value: 'event', label: 'Menu sự kiện' },
]

const EMPTY_SET = { name: '', type: 'regular', description: '', isActive: false }
const EMPTY_ITEM = { name: '', category: '', price: '', description: '', available: true }

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ'
}

function normalizeKey(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return row[key]
    }
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
  const text = String(value || '').replace(/[^\d]/g, '')
  return Number(text || 0)
}

function parseWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const XLSX = await import('xlsx')
        const workbook = XLSX.read(event.target.result, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        resolve(rows.map((row) => ({
          name: String(normalizeKey(row, ['Tên món', 'Ten mon', 'name', 'Name'])).trim(),
          category: String(normalizeKey(row, ['Danh mục', 'Danh muc', 'category', 'Category'])).trim(),
          price: parsePrice(normalizeKey(row, ['Giá', 'Gia', 'price', 'Price'])),
          description: String(normalizeKey(row, ['Mô tả', 'Mo ta', 'description', 'Description'])).trim(),
          available: parseAvailable(normalizeKey(row, ['Đang bán', 'Dang ban', 'available', 'Available'])),
        })).filter((item) => item.name || item.category || item.price))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export default function MenuSettings() {
  const [sets, setSets] = useState([])
  const [selectedSetId, setSelectedSetId] = useState(null)
  const [items, setItems] = useState([])
  const [newSet, setNewSet] = useState(EMPTY_SET)
  const [newItem, setNewItem] = useState(EMPTY_ITEM)
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItem, setEditingItem] = useState(EMPTY_ITEM)
  const [importMode, setImportMode] = useState('append')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  const selectedSet = sets.find((set) => set.id === selectedSetId)
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  )

  const showStatus = (message) => {
    setStatus(message)
    setTimeout(() => setStatus(''), 2800)
  }

  const loadSets = async () => {
    const data = await api.get('/menu/sets')
    setSets(data.sets || [])
    setSelectedSetId((current) => current || data.sets?.[0]?.id || null)
  }

  const loadItems = async (setId) => {
    if (!setId) {
      setItems([])
      return
    }
    const data = await api.get(`/menu/sets/${setId}/items`)
    setItems(data.items || [])
  }

  useEffect(() => {
    setLoading(true)
    loadSets()
      .catch((err) => showStatus(err.message || 'Chưa tải được bộ menu'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadItems(selectedSetId).catch((err) => showStatus(err.message || 'Chưa tải được món'))
  }, [selectedSetId])

  const refreshAll = async (setId = selectedSetId) => {
    await loadSets()
    await loadItems(setId)
    await fetchMenu()
  }

  const handleCreateSet = async () => {
    if (!newSet.name.trim()) return showStatus('Nhập tên bộ menu trước đã.')
    const data = await api.post('/menu/sets', newSet)
    setNewSet(EMPTY_SET)
    setSelectedSetId(data.set.id)
    await refreshAll(data.set.id)
    showStatus('Đã tạo bộ menu mới.')
  }

  const handleActivateSet = async (setId) => {
    await api.post(`/menu/sets/${setId}/activate`, {})
    setSelectedSetId(setId)
    await refreshAll(setId)
    showStatus('Đã đặt làm menu đang bán.')
  }

  const handleCreateItem = async () => {
    if (!selectedSetId) return showStatus('Chọn một bộ menu trước.')
    if (!newItem.name || !newItem.category || !newItem.price) return showStatus('Nhập đủ tên món, danh mục và giá.')
    await api.post(`/menu/sets/${selectedSetId}/items`, {
      ...newItem,
      price: Number(newItem.price),
    })
    setNewItem(EMPTY_ITEM)
    await refreshAll(selectedSetId)
    showStatus('Đã thêm món.')
  }

  const startEditItem = (item) => {
    setEditingItemId(item.id)
    setEditingItem({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      available: item.available,
    })
  }

  const handleSaveItem = async () => {
    await api.patch(`/menu/${editingItemId}`, {
      ...editingItem,
      price: Number(editingItem.price),
    })
    setEditingItemId(null)
    await refreshAll(selectedSetId)
    showStatus('Đã lưu món.')
  }

  const handleToggleItem = async (item) => {
    await api.patch(`/menu/${item.id}`, { available: !item.available })
    await refreshAll(selectedSetId)
  }

  const handleDownloadTemplate = () => {
    import('xlsx').then((XLSX) => {
    const rows = [
      { 'Tên món': 'Gỏi cuốn', 'Danh mục': 'Đồ nhắm', 'Giá': 65000, 'Mô tả': 'Rau tươi, tôm thịt', 'Đang bán': 'Có' },
      { 'Tên món': 'Bia Tiger', 'Danh mục': 'Đồ uống', 'Giá': 30000, 'Mô tả': 'Lon/chai', 'Đang bán': 'Có' },
      { 'Tên món': 'Lẩu Thái', 'Danh mục': 'Nhậu chính', 'Giá': 280000, 'Mô tả': 'Size vừa', 'Đang bán': 'Có' },
    ]
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu')
    XLSX.writeFile(workbook, 'staffos-menu-mau.xlsx')
    }).catch(() => showStatus('Chưa tạo được file Excel mẫu.'))
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selectedSetId) return

    try {
      const parsedItems = await parseWorkbook(file)
      const data = await api.post(`/menu/sets/${selectedSetId}/import`, {
        mode: importMode,
        items: parsedItems,
      })
      await refreshAll(selectedSetId)
      showStatus(`Đã import ${data.insertedCount} món${data.skippedCount ? `, bỏ qua ${data.skippedCount} dòng` : ''}.`)
    } catch (err) {
      showStatus(err.message || 'Import Excel thất bại.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Bộ menu</h2>
          <p className="text-sm text-slate-400 mt-0.5">Tạo menu ngày thường, ngày lễ rồi chọn bộ đang bán cho QR và order.</p>
        </div>
        {status && (
          <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
            {status}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[330px_1fr] gap-5">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800">Tạo bộ menu</h3>
            </div>
            <div className="space-y-3">
              <input
                value={newSet.name}
                onChange={(e) => setNewSet({ ...newSet, name: e.target.value })}
                placeholder="VD: Menu ngày lễ 30/4"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <select
                value={newSet.type}
                onChange={(e) => setNewSet({ ...newSet, type: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              >
                {MENU_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <textarea
                value={newSet.description}
                onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                placeholder="Ghi chú ngắn cho bộ menu"
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={newSet.isActive}
                  onChange={(e) => setNewSet({ ...newSet, isActive: e.target.checked })}
                  className="accent-emerald-600"
                />
                Đặt làm menu đang bán
              </label>
              <button
                onClick={handleCreateSet}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
              >
                <Plus size={16} />
                Tạo bộ menu
              </button>
            </div>
          </Card>

          <div className="space-y-2">
            {loading && <Card className="p-4 text-sm text-slate-400">Đang tải menu...</Card>}
            {sets.map((set) => (
              <button
                key={set.id}
                onClick={() => setSelectedSetId(set.id)}
                className={`w-full text-left bg-white border rounded-2xl p-4 transition-all ${
                  selectedSetId === set.id
                    ? 'border-emerald-300 shadow-soft ring-2 ring-emerald-100'
                    : 'border-slate-100 hover:border-emerald-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={17} className="text-emerald-600 flex-shrink-0" />
                      <p className="font-bold text-slate-800 truncate">{set.name}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{MENU_TYPES.find((type) => type.value === set.type)?.label || set.type}</p>
                  </div>
                  {set.is_active && (
                    <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">Đang bán</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-3 line-clamp-2">{set.description || 'Chưa có ghi chú'}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <span>{set.available_count}/{set.item_count} món đang bán</span>
                  {!set.is_active && (
                    <span
                      onClick={(event) => {
                        event.stopPropagation()
                        handleActivateSet(set.id)
                      }}
                      className="text-emerald-700 font-bold"
                    >
                      Kích hoạt
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800">{selectedSet?.name || 'Chọn bộ menu'}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{items.length} món · {categories.length} danh mục</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="append">Import thêm</option>
                  <option value="replace">Ẩn món cũ rồi import</option>
                </select>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200"
                >
                  <Download size={15} />
                  Excel mẫu
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedSetId}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Upload size={15} />
                  Import Excel
                </button>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_130px] gap-3">
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Tên món"
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <input
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Danh mục"
                list="menu-categories"
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Giá"
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Mô tả món"
                className="md:col-span-2 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <button
                onClick={handleCreateItem}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100"
              >
                <Plus size={16} />
                Thêm món
              </button>
              <datalist id="menu-categories">
                {categories.map((category) => <option key={category} value={category} />)}
              </datalist>
            </div>
          </Card>

          <Card className="overflow-hidden">
            {items.length === 0 ? (
              <div className="p-10 text-center">
                <FileSpreadsheet size={34} className="text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700">Bộ menu này chưa có món</p>
                <p className="text-sm text-slate-400 mt-1">Thêm món thủ công hoặc import từ file Excel mẫu.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const editing = editingItemId === item.id
                  return (
                    <div key={item.id} className="p-4">
                      {editing ? (
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_130px_auto] gap-3 items-center">
                          <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          <input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          <div className="flex gap-1">
                            <button onClick={handleSaveItem} className="p-2 rounded-xl bg-emerald-600 text-white"><Save size={16} /></button>
                            <button onClick={() => setEditingItemId(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500"><X size={16} /></button>
                          </div>
                          <input value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="md:col-span-3 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800">{item.name}</p>
                              {item.available ? (
                                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">Đang bán</span>
                              ) : (
                                <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold">Ẩn</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{item.category}{item.description ? ` · ${item.description}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-black text-emerald-600">{formatPrice(item.price)}</p>
                            <button onClick={() => handleToggleItem(item)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => startEditItem(item)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100">
                              <Pencil size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
