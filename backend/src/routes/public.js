import { Router } from 'express'
import { query, queryOne, queryAll } from '../db/pool.js'

const router = Router()

/**
 * GET /api/public/:slug/table/:tableId
 * Lấy thông tin bàn + menu — không cần auth
 * Dùng cho trang QR menu của khách
 */
router.get('/:slug/table/:tableId', async (req, res) => {
  try {
    const { slug, tableId } = req.params

    // Tìm tenant theo slug
    const tenant = await queryOne(
      'SELECT id, name, address FROM tenants WHERE slug = $1',
      [slug]
    )
    if (!tenant) {
      return res.status(404).json({ error: 'Không tìm thấy quán' })
    }

    // Tìm bàn — đảm bảo bàn thuộc đúng tenant
    const table = await queryOne(
      'SELECT id, name, zone, capacity, status FROM tables WHERE id = $1 AND tenant_id = $2',
      [tableId, tenant.id]
    )
    if (!table) {
      return res.status(404).json({ error: 'Không tìm thấy bàn' })
    }

    // Lấy menu
    const items = await queryAll(
      `SELECT id, name, category, price, description
       FROM menu_items
       WHERE tenant_id = $1 AND available = true
       ORDER BY category, sort_order, name`,
      [tenant.id]
    )

    // Group theo category
    const menu = {}
    for (const item of items) {
      if (!menu[item.category]) menu[item.category] = []
      menu[item.category].push(item)
    }

    res.json({
      tenant: { name: tenant.name, address: tenant.address },
      table,
      menu,
      categories: Object.keys(menu),
    })
  } catch (err) {
    console.error('[Public] Get table+menu error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

/**
 * POST /api/public/:slug/orders
 * Khách gửi order — không cần auth
 * Body: { tableId, items: [{ menuItemId, name, price, quantity, note }] }
 */
router.post('/:slug/orders', async (req, res) => {
  try {
    const { slug } = req.params
    const { tableId, items, guestNote } = req.body

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Thiếu bàn hoặc món' })
    }

    // Tìm tenant
    const tenant = await queryOne(
      'SELECT id FROM tenants WHERE slug = $1',
      [slug]
    )
    if (!tenant) {
      return res.status(404).json({ error: 'Không tìm thấy quán' })
    }

    // Xác nhận bàn thuộc tenant
    const table = await queryOne(
      'SELECT id, name FROM tables WHERE id = $1 AND tenant_id = $2',
      [tableId, tenant.id]
    )
    if (!table) {
      return res.status(404).json({ error: 'Bàn không hợp lệ' })
    }

    // Validate giá từ DB — không tin giá từ client
    const validatedItems = []
    for (const item of items) {
      const menuItem = await queryOne(
        'SELECT id, name, price FROM menu_items WHERE id = $1 AND tenant_id = $2 AND available = true',
        [item.menuItemId, tenant.id]
      )
      if (!menuItem) {
        return res.status(400).json({ error: `Món "${item.name}" không còn phục vụ` })
      }
      validatedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price, // dùng giá từ DB
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        note: item.note || '',
      })
    }

    const total = validatedItems.reduce((s, i) => s + i.price * i.quantity, 0)

    // Tạo order với source = 'guest' để phân biệt với order của phục vụ
    const { rows: [order] } = await query(
      `INSERT INTO orders (tenant_id, table_id, user_id, guest_count, note, total, status)
       VALUES ($1, $2, NULL, 1, $3, $4, 'open') RETURNING *`,
      [tenant.id, tableId, guestNote || '', total]
    )

    // Thêm từng món
    for (const item of validatedItems) {
      await query(
        `INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, note, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [order.id, item.menuItemId, item.name, item.price, item.quantity, item.note]
      )
    }

    // Cập nhật trạng thái bàn → occupied
    await query(
      `UPDATE tables SET status = 'occupied' WHERE id = $1 AND tenant_id = $2`,
      [tableId, tenant.id]
    )

    // Lấy order đầy đủ
    const orderItems = await queryAll(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    )

    const fullOrder = {
      ...order,
      table_name: table.name,
      items: orderItems,
      source: 'guest', // đánh dấu order từ khách tự gọi
    }

    // 🔥 Emit realtime → màn hình bếp + phục vụ
    const io = req.app.get('io')
    io.to('kitchen').emit('new-order', fullOrder)
    io.to('waiter').emit('new-order', fullOrder)
    io.to('waiter').emit('table-updated', { id: tableId, status: 'occupied' })
    io.to('cashier').emit('table-updated', { id: tableId, status: 'occupied' })

    res.status(201).json({
      success: true,
      orderId: order.id,
      total,
      message: 'Order đã gửi xuống bếp!',
    })
  } catch (err) {
    console.error('[Public] Guest order error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
