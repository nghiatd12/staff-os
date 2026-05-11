# StaffOS — Hệ thống Quản lý Quán Nhậu

Nền tảng SaaS quản lý F&B toàn diện: gọi món, sơ đồ bàn, màn hình bếp, thu ngân, nhân viên, loyalty.

## Cấu trúc project

```
staffos/
├── frontend/          ← React + Vite + Tailwind (deploy Vercel)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/           ← Node.js + Express + Socket.IO (deploy Railway)
│   ├── src/
│   ├── package.json
│   └── .env
└── README.md
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend
npm install
# Sửa DATABASE_URL trong .env (dùng Neon free)
npm run db:migrate   # Tạo bảng
npm run db:seed      # Data mẫu
npm run dev          # http://localhost:3001
```

## Deploy

| Service | Provider | URL |
|---------|----------|-----|
| Frontend | Vercel | staffos.vercel.app |
| Backend | Railway | staffos-api.railway.app |
| Database | Neon | PostgreSQL serverless |

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client
- **Backend**: Node.js, Express, PostgreSQL, Socket.IO, JWT, bcrypt
- **Database**: PostgreSQL (Neon serverless)

## Tài khoản test (sau khi seed)

| Vai trò | SĐT | Mật khẩu |
|---------|------|-----------|
| Chủ quán | 0901234567 | 123456 |
| Phục vụ | 0912345678 | 1234 |
| Thu ngân | 0934567890 | 3456 |
| Bếp | 0945678901 | 4567 |
