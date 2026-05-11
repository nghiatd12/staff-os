import { Router } from 'express'
import { query, queryAll } from '../db/pool.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/menu
 * Lấy menu — không cần auth (cho QR menu khách quét)
 * Query param: ?tenant=slug
 */
router.get('/', async (req, res) => {
  try {
    let tenantId = null

    // Nếu có token → lấy từ token
    if (req.headers.authorization) {
      try {
        const jwt = await import('jsonwebtoken')
        const token = req.headers.authorization.split(' ')[1]
        const payload = jwt.default.verify(token, process.env.JWT_SECRET)
        tenantId = payload.tenantId
      } catch (e) { /* ignore */ }
    }

    // Nếu không có token → lấy từ query param slug
    if (!tenantId && req.query.tenant) {
      const { rows } = await query('SELECT id FROM tenants WHERE slug = $1', [req.query.tenant])
      if (rows[0]) tenantId = rows[0].id
    }

    if (!tenantId) {
      return res.status(400).json({ error: 'Thiếu thông tin quán' })
    }

    const items = await queryAll(
      `SELECT id, name, category, price, description, available
       FROM menu_items WHERE tenant_id = $1 AND available = true
       ORDER BY category, sort_order, name`,
      [tenantId]
    )

    // Group theo category
    const menu = {}
    for (const item of items) {
      if (!menu[item.category]) menu[item.category] = []
      menu[item.category].push(item)
    }

    res.json({ menu, categories: Object.keys(menu) })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

/**
 * POST /api/menu
 * Thêm món mới (owner/manager)
 */
router.post('/', authenticate, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { name, category, price, description } = req.body
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Thiếu thông tin món' })
    }

    const { rows: [item] } = await query(
      `INSERT INTO menu_items (tenant_id, name, category, price, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.tenantId, name, category, price, description || '']
    )
    res.status(201).json({ item })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

/**
 * PATCH /api/menu/:id
 * Cập nhật món (giá, tên, available)
 */
router.patch('/:id', authenticate, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { name, price, available, category, description } = req.body
    const { rows: [item] } = await query(
      `UPDATE menu_items SET
        name = COALESCE($1, name),
        price = COALESCE($2, price),
        available = COALESCE($3, available),
        category = COALESCE($4, category),
        description = COALESCE($5, description)
       WHERE id = $6 AND tenant_id = $7 RETURNING *`,
      [name, price, available, category, description, req.params.id, req.user.tenantId]
    )
    if (!item) return res.status(404).json({ error: 'Không tìm thấy món' })
    res.json({ item })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
