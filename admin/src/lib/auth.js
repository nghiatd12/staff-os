const TOKEN_KEY = 'staffos_admin_token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}
