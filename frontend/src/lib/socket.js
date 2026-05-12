/**
 * Socket.IO client singleton
 * Kết nối 1 lần, dùng chung toàn app
 */
import { io } from 'socket.io-client'
import { getToken } from './auth'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let _socket = null

export function getSocket() {
  return _socket
}

export function connectSocket(role) {
  if (_socket?.connected) {
    // Đã kết nối — join room mới nếu cần
    if (role) _socket.emit('join-role', role)
    return _socket
  }

  _socket = io(SOCKET_URL, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  })

  _socket.on('connect', () => {
    console.log('[Socket] Connected:', _socket.id)
    // Join room theo role
    if (role) _socket.emit('join-role', role)
    // KDS page cần join kitchen room bất kể role
    _socket.emit('join-role', 'kitchen')
    _socket.emit('join-role', 'waiter')
    _socket.emit('join-role', 'cashier')
  })

  _socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
  })

  _socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message)
  })

  return _socket
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect()
    _socket = null
  }
}
