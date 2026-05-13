import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query, queryOne } from '../db/pool.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

function createSlug(name) {
  const base = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `quan-${Date.now()}`
}

async function uniqueSlug(name) {
  const base = createSlug(name)
  let slug = base
  let suffix = 1
  while (await queryOne('SELECT id FROM tenants WHERE slug = $1', [slug])) {
    suffix += 1
    slug = `${base}-${suffix}`
  }
  return slug
}

async function verifyAdminPassword(password, configuredPassword) {
  if (!configuredPassword) return false
  if (configuredPassword.startsWith('$2a$') || configuredPassword.startsWith('$2b$') || configuredPassword.startsWith('$2y$')) {
    return bcrypt.compare(password, configuredPassword)
  }
  return password === configuredPassword
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })
    if (!adminEmail || !adminPassword) return res.status(500).json({ error: 'Chưa cấu hình tài khoản admin' })

    const validEmail = email.toLowerCase() === adminEmail.toLowerCase()
    const validPassword = await verifyAdminPassword(password, adminPassword)
    if (!validEmail || !validPassword) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })

    const token = jwt.sign(
      { role: 'superadmin', email: adminEmail },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({ token, admin: { email: adminEmail, role: 'superadmin' } })
  } catch (err) {
    console.error('[Admin] Login error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.use(adminAuth)

router.get('/stats', async (req, res) => {
  try {
    const tenantStats = await queryOne(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'active')::int AS active,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'inactive')::int AS inactive,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS new_this_month
       FROM tenants
       WHERE deleted_at IS NULL`
    )
    const employeeStats = await queryOne(
      `SELECT COUNT(e.id)::int AS total_employees
       FROM employees e
       JOIN tenants t ON t.id = e.tenant_id
       WHERE t.deleted_at IS NULL`
    )

    res.json({
      total: tenantStats.total,
      active: tenantStats.active,
      pending: tenantStats.pending,
      inactive: tenantStats.inactive,
      totalEmployees: employeeStats.total_employees,
      newThisMonth: tenantStats.new_this_month,
    })
  } catch (err) {
    console.error('[Admin] Stats error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.get('/tenants', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const offset = (page - 1) * limit
    const search = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim()
    const sort = req.query.sort === 'newest' ? 'newest' : 'default'

    const where = ['t.deleted_at IS NULL']
    const params = []
    if (search) {
      params.push(`%${search}%`)
      where.push(`(t.name ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.phone ILIKE $${params.length})`)
    }
    if (status) {
      params.push(status)
      where.push(`t.status = $${params.length}`)
    }

    const whereSql = where.join(' AND ')
    const countRow = await queryOne(
      `SELECT COUNT(DISTINCT t.id)::int AS total
       FROM tenants t
       LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'owner'
       WHERE ${whereSql}`,
      params
    )

    params.push(limit, offset)
    const orderSql = sort === 'newest' ? 't.created_at DESC, t.id DESC' : 't.id DESC'
    const { rows: tenants } = await query(
      `SELECT
        t.id, t.name, t.slug, t.address, t.phone, t.type, t.table_count, t.plan,
        t.status, t.notes, t.owner_name, t.owner_email, t.registered_by, t.created_at,
        u.name AS owner_user_name, u.phone AS owner_phone
       FROM tenants t
       LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'owner'
       WHERE ${whereSql}
       ORDER BY ${orderSql}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    const total = countRow.total || 0
    res.json({ tenants, total, page, totalPages: Math.ceil(total / limit) || 1 })
  } catch (err) {
    console.error('[Admin] List tenants error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/tenants', async (req, res) => {
  try {
    const {
      restaurantName, ownerName, ownerPhone, ownerPassword, address = '', type = 'beer',
      tableCount = 15, plan = 'starter', status = 'pending', notes = '',
    } = req.body

    if (!restaurantName || !ownerName || !ownerPhone || !ownerPassword) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
    }

    const existing = await queryOne('SELECT id FROM users WHERE phone = $1', [ownerPhone])
    if (existing) return res.status(409).json({ error: 'Số điện thoại đã được đăng ký' })

    const slug = await uniqueSlug(restaurantName)
    const count = Math.max(1, parseInt(tableCount) || 15)

    const { rows: [tenant] } = await query(
      `INSERT INTO tenants
        (name, slug, address, phone, type, table_count, plan, status, notes, owner_name, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'admin')
       RETURNING *`,
      [restaurantName, slug, address, ownerPhone, type, count, plan, status, notes, ownerName]
    )

    const passwordHash = await bcrypt.hash(ownerPassword, 10)
    const { rows: [owner] } = await query(
      `INSERT INTO users (tenant_id, name, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'owner')
       RETURNING id, name, phone, role`,
      [tenant.id, ownerName, ownerPhone, passwordHash]
    )

    for (let i = 1; i <= count; i++) {
      await query(
        `INSERT INTO tables (tenant_id, name, zone, capacity)
         VALUES ($1, $2, $3, $4)`,
        [tenant.id, `Bàn ${i}`, i <= Math.ceil(count * 0.6) ? 'indoor' : 'outdoor', 4]
      )
    }

    res.status(201).json({ tenant, owner })
  } catch (err) {
    console.error('[Admin] Create tenant error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.get('/tenants/:id', async (req, res) => {
  try {
    const tenant = await queryOne(
      `SELECT * FROM tenants WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    )
    if (!tenant) return res.status(404).json({ error: 'Không tìm thấy quán' })

    const owner = await queryOne(
      `SELECT id, name, phone, role, is_active, created_at
       FROM users WHERE tenant_id = $1 AND role = 'owner'
       ORDER BY id LIMIT 1`,
      [tenant.id]
    )
    const stats = await queryOne(
      `SELECT
        COUNT(DISTINCT o.id)::int AS total_orders,
        COALESCE(SUM(CASE WHEN o.created_at >= date_trunc('month', NOW()) THEN o.total ELSE 0 END), 0)::int AS revenue_this_month,
        (SELECT COUNT(*)::int FROM employees e WHERE e.tenant_id = $1 AND e.is_active = true) AS total_employees
       FROM orders o
       WHERE o.tenant_id = $1`,
      [tenant.id]
    )

    res.json({
      tenant,
      owner,
      stats: {
        totalOrders: stats.total_orders,
        revenueThisMonth: stats.revenue_this_month,
        totalEmployees: stats.total_employees,
      },
    })
  } catch (err) {
    console.error('[Admin] Tenant detail error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.patch('/tenants/:id', async (req, res) => {
  try {
    const allowed = ['status', 'plan', 'notes']
    const fields = []
    const params = []

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        params.push(req.body[key])
        fields.push(`${key} = $${params.length}`)
      }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Không có field để cập nhật' })

    params.push(req.params.id)
    const { rows: [tenant] } = await query(
      `UPDATE tenants SET ${fields.join(', ')}
       WHERE id = $${params.length} AND deleted_at IS NULL
       RETURNING *`,
      params
    )
    if (!tenant) return res.status(404).json({ error: 'Không tìm thấy quán' })
    res.json({ tenant })
  } catch (err) {
    console.error('[Admin] Update tenant error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/tenants/:id', async (req, res) => {
  try {
    const { rows: [tenant] } = await query(
      `UPDATE tenants SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
      [req.params.id]
    )
    if (!tenant) return res.status(404).json({ error: 'Không tìm thấy quán' })
    res.json({ success: true, tenant })
  } catch (err) {
    console.error('[Admin] Delete tenant error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
