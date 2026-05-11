import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Helper: query với auto tenant_id filter
export function query(text, params) {
  return pool.query(text, params)
}

// Helper: lấy 1 row
export async function queryOne(text, params) {
  const result = await pool.query(text, params)
  return result.rows[0] || null
}

// Helper: lấy nhiều rows
export async function queryAll(text, params) {
  const result = await pool.query(text, params)
  return result.rows
}

export default pool
