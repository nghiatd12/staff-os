import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Routes
import authRoutes from './routes/auth.js'
import tablesRoutes from './routes/tables.js'
import menuRoutes from './routes/menu.js'
import ordersRoutes from './routes/orders.js'

const app = express()
const httpServer = createServer(app)

// Socket.IO — realtime cho KDS
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' }
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Gắn io vào request để routes có thể emit events
app.set('io', io)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/tables', tablesRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', ordersRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  // Join room theo role (kitchen, waiter, cashier)
  socket.on('join-role', (role) => {
    socket.join(role)
    console.log(`[Socket] ${socket.id} joined room: ${role}`)
  })

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })
})

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`\n🚀 StaffOS Backend running on http://localhost:${PORT}`)
  console.log(`📡 Socket.IO ready`)
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}\n`)
})

export { io }
