# StaffOS Backend

Node.js + Express + PostgreSQL + Socket.IO

## Setup

```bash
# 1. Cài dependencies
npm install

# 2. Tạo database PostgreSQL
createdb staffos

# 3. Copy env
cp .env.example .env
# Sửa DATABASE_URL nếu cần

# 4. Chạy migration (tạo bảng)
npm run db:migrate

# 5. Seed data mẫu
npm run db:seed

# 6. Chạy server
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Đăng ký quán mới
- `POST /api/auth/login` — Đăng nhập
- `GET /api/auth/me` — Thông tin user (cần token)

### Tables
- `GET /api/tables` — Danh sách bàn
- `POST /api/tables` — Thêm bàn (owner/manager)
- `PATCH /api/tables/:id/status` — Đổi trạng thái bàn
- `DELETE /api/tables/:id` — Xóa bàn (owner)

### Menu
- `GET /api/menu?tenant=slug` — Lấy menu (public, cho QR)
- `POST /api/menu` — Thêm món (owner/manager)
- `PATCH /api/menu/:id` — Sửa món

### Orders
- `POST /api/orders` — Tạo order mới
- `GET /api/orders/active` — Orders đang mở
- `PATCH /api/orders/:id/items/:itemId` — Tick món (bếp)
- `PATCH /api/orders/:id/complete` — Hoàn thành order
- `PATCH /api/orders/:id/pay` — Thanh toán

## Socket.IO Events

### Client → Server
- `join-role` — Join room theo vai trò (kitchen/waiter/cashier)

### Server → Client
- `new-order` — Order mới (→ kitchen)
- `item-updated` — Món được tick (→ kitchen, waiter)
- `order-ready` — Order xong (→ waiter)
- `order-completed` — Bếp xong (→ kitchen)
- `table-updated` — Bàn đổi trạng thái (→ waiter, cashier)

## Test Login
- Chủ quán: `0901234567` / `123456`
- Phục vụ: `0912345678` / `1234`
- Thu ngân: `0934567890` / `3456`
- Bếp: `0945678901` / `4567`
