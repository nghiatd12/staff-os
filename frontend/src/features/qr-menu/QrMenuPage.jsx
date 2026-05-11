import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { QrCode, Printer, Copy, Smartphone, CheckCircle2 } from '@/components/ui/Icon'
import { api } from '@/lib/api'

const STORE_SLUG = 'bia-garden-q7'
const BASE_URL = 'https://staffos.vn'

function getTableUrl(tableId) {
  return `${BASE_URL}/${STORE_SLUG}/ban/${tableId}`
}

export default function QrMenuPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    api.get('/tables')
      .then((data) => {
        setTables(data.tables || [])
      })
      .catch(() => {
        setTables([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = (table) => {
    const url = getTableUrl(table.id)
    navigator.clipboard?.writeText(url)
    setCopiedId(table.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeCount = tables.length
  const totalScans = 0 // No scan data from API

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center fade-in">
        <p className="text-slate-400 text-sm">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">QR Menu — Khách tự gọi</h1>
          <p className="text-sm text-slate-400 mt-1">
            Mỗi bàn có mã QR riêng. Khách quét → xem menu → gọi món trực tiếp.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
          <Smartphone size={16} />
          {showPreview ? 'Ẩn xem trước' : 'Xem trước menu'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <QrCode size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{activeCount}</p>
            <p className="text-[11px] text-slate-400">QR đang hoạt động</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Smartphone size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{totalScans}</p>
            <p className="text-[11px] text-slate-400">Tổng lượt quét</p>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-slate-400 mb-1">URL cửa hàng</p>
          <p className="text-sm font-medium text-emerald-700 truncate">{BASE_URL}/{STORE_SLUG}/ban/...</p>
        </Card>
      </div>

      {tables.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400 text-sm">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* QR Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {tables.map((table) => {
                const url = getTableUrl(table.id)
                return (
                  <Card key={table.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">{table.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{url}</p>
                      </div>
                      <Badge variant="success" dot>
                        Bật
                      </Badge>
                    </div>

                    {/* QR Code thật — quét được */}
                    <div className="flex justify-center my-4">
                      <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-soft">
                        <QRCodeSVG
                          value={url}
                          size={120}
                          level="M"
                          bgColor="#ffffff"
                          fgColor="#1e293b"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>{table.zone === 'indoor' ? 'Trong nhà' : table.zone === 'outdoor' ? 'Ngoài trời' : 'VIP'}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCopy(table)}
                      >
                        {copiedId === table.id ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy link
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.print()}>
                        <Printer size={14} />
                        In
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Mobile Preview */}
          {showPreview && (
            <div className="lg:w-[320px] shrink-0">
              <Card className="p-4 sticky top-6">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm">Xem trước trên điện thoại</h3>
                <div className="rounded-3xl border-4 border-slate-800 overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  <div className="h-full bg-white flex flex-col">
                    {/* Status bar */}
                    <div className="h-6 bg-slate-800 flex items-center justify-center">
                      <div className="w-16 h-1.5 bg-slate-600 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-4 py-3 text-white text-center" style={{ backgroundColor: '#10b981' }}>
                      <p className="text-[10px] opacity-80">Bàn 1 — Trong nhà</p>
                      <h4 className="text-sm font-bold">Menu Bia Garden Q7</h4>
                    </div>

                    {/* Menu items mockup */}
                    <div className="flex-1 p-3 space-y-2 overflow-hidden">
                      {['Lẩu Thái', 'Gà nướng muối ớt', 'Nem nướng', 'Bia Tiger'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[10px]">🍽️</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-slate-700 truncate">{item}</p>
                            <p className="text-[9px] text-slate-400">{[280, 180, 85, 30][i]}k</p>
                          </div>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: '#10b981' }}>
                            +
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="p-3 border-t border-slate-100">
                      <div className="w-full py-2 rounded-xl text-white text-center text-[10px] font-semibold" style={{ backgroundColor: '#10b981' }}>
                        Gửi order (2 món) — 310.000đ
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Giao diện khách hàng khi quét QR
                </p>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
