import { useState } from 'react'
import {
  Settings, Table2, Printer, Bell, Shield, Plus, Trash2, Pencil
} from '@/components/ui/Icon'
import Card from '@/components/ui/Card'

const TABS = [
  { id: 'general',  label: 'Thông tin chung', Icon: Settings },
  { id: 'zones',    label: 'Khu vực & Bàn',   Icon: Table2 },
  { id: 'printer',  label: 'Cài đặt in',      Icon: Printer },
  { id: 'notify',   label: 'Thông báo',       Icon: Bell },
  { id: 'roles',    label: 'Phân quyền',      Icon: Shield },
]

const INITIAL_ZONES = [
  { id: 'indoor',  name: 'Trong nhà',   tables: 8, description: 'Khu vực chính bên trong' },
  { id: 'outdoor', name: 'Ngoài trời',  tables: 4, description: 'Sân vườn, ban công' },
  { id: 'vip',     name: 'Phòng VIP',   tables: 3, description: 'Phòng riêng, karaoke' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('zones')
  const [zones, setZones] = useState(INITIAL_ZONES)
  const [editingZone, setEditingZone] = useState(null)
  const [newZone, setNewZone] = useState({ name: '', tables: '', description: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddZone = () => {
    if (!newZone.name || !newZone.tables) return
    setZones([...zones, { id: Date.now().toString(), name: newZone.name, tables: parseInt(newZone.tables), description: newZone.description }])
    setNewZone({ name: '', tables: '', description: '' })
    setShowAddForm(false)
  }

  const handleDeleteZone = (id) => {
    setZones(zones.filter((z) => z.id !== id))
  }

  return (
    <div className="p-6 lg:p-8 fade-in h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cài đặt</h1>
        <p className="text-slate-400 text-sm mt-1">Quản lý cấu hình hệ thống</p>
      </div>

      <div className="flex gap-6">
        {/* Left tabs */}
        <div className="w-56 flex-shrink-0">
          <div className="space-y-1">
            {TABS.map((tab) => {
              const IconComp = tab.Icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <IconComp size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {activeTab === 'zones' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Khu vực & Bàn</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Cấu hình khu vực và số bàn trong mỗi khu vực</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <Plus size={16} />
                  Thêm khu vực
                </button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <Card className="p-5 mb-5 border-2 border-emerald-200 bg-emerald-50/30">
                  <h3 className="font-semibold text-slate-800 mb-4">Thêm khu vực mới</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Tên khu vực *</label>
                      <input
                        type="text"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                        placeholder="VD: Tầng 2"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Số bàn *</label>
                      <input
                        type="number"
                        value={newZone.tables}
                        onChange={(e) => setNewZone({ ...newZone, tables: e.target.value })}
                        placeholder="VD: 6"
                        min="1"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Mô tả</label>
                      <input
                        type="text"
                        value={newZone.description}
                        onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                        placeholder="VD: Khu vực yên tĩnh"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddZone}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      Lưu khu vực
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200"
                    >
                      Hủy
                    </button>
                  </div>
                </Card>
              )}

              {/* Zone list */}
              <div className="space-y-3">
                {zones.map((zone) => (
                  <Card key={zone.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <Table2 size={22} className="text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{zone.name}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">{zone.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-800">{zone.tables}</p>
                          <p className="text-[11px] text-slate-400">bàn</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Tổng cộng</span>
                  <span className="text-sm font-bold text-slate-800">
                    {zones.reduce((s, z) => s + z.tables, 0)} bàn · {zones.length} khu vực
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Thông tin nhà hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Tên nhà hàng</label>
                  <input type="text" defaultValue="District 1 - Beer Club" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Địa chỉ</label>
                  <input type="text" defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Số điện thoại</label>
                  <input type="text" defaultValue="0901 234 567" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
                </div>
              </div>
            </Card>
          )}

          {activeTab !== 'zones' && activeTab !== 'general' && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Settings size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Đang phát triển</p>
              <p className="text-slate-400 text-sm mt-1">Tính năng này sẽ sớm được cập nhật</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
