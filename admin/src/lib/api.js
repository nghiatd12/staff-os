import { getAdminToken, removeAdminToken } from './auth'

const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001/api'

async function request(method, path, body) {
  const token = getAdminToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    removeAdminToken()
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Lỗi ${res.status}`)
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
