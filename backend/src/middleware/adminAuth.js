import jwt from 'jsonwebtoken'

export function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
      return res.status(401).json({ error: 'Thiếu token admin' })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'superadmin') {
      return res.status(403).json({ error: 'Không có quyền truy cập admin' })
    }

    req.admin = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token admin không hợp lệ' })
  }
}
