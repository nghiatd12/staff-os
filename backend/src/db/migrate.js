import 'dotenv/config'
import pool from './pool.js'

/**
 * Database Migration — tạo tất cả bảng cho StaffOS
 * Chạy: npm run db:migrate
 */
async function migrate() {
  console.log('🗄️  Running migrations...\n')

  await pool.query(`
    -- ============================================
    -- 1. TENANTS (Quán)
    -- ============================================
    CREATE TABLE IF NOT EXISTS tenants (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      slug          VARCHAR(100) UNIQUE NOT NULL,
      address       TEXT,
      phone         VARCHAR(20),
      type          VARCHAR(50) DEFAULT 'beer',
      table_count   INT DEFAULT 15,
      plan          VARCHAR(20) DEFAULT 'starter',
      created_at    TIMESTAMP DEFAULT NOW()
    );

    -- ============================================
    -- 2. USERS (Tài khoản đăng nhập)
    -- ============================================
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      tenant_id     INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name          VARCHAR(255) NOT NULL,
      phone         VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(20) NOT NULL DEFAULT 'waiter',
      pin           VARCHAR(6),
      is_active     BOOLEAN DEFAULT true,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

    -- ============================================
    -- 3. TABLES (Bàn)
    -- ============================================
    CREATE TABLE IF NOT EXISTS tables (
      id            SERIAL PRIMARY KEY,
      tenant_id     INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name          VARCHAR(50) NOT NULL,
      zone          VARCHAR(50) DEFAULT 'indoor',
      capacity      INT DEFAULT 4,
      status        VARCHAR(20) DEFAULT 'empty',
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_tables_tenant ON tables(tenant_id);

    -- ============================================
    -- 4. MENU ITEMS (Thực đơn)
    -- ============================================
    CREATE TABLE IF NOT EXISTS menu_items (
      id            SERIAL PRIMARY KEY,
      tenant_id     INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name          VARCHAR(255) NOT NULL,
      category      VARCHAR(100) NOT NULL,
      price         INT NOT NULL,
      description   TEXT,
      available     BOOLEAN DEFAULT true,
      sort_order    INT DEFAULT 0,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_menu_tenant ON menu_items(tenant_id);

    -- ============================================
    -- 5. ORDERS (Đơn hàng)
    -- ============================================
    CREATE TABLE IF NOT EXISTS orders (
      id            SERIAL PRIMARY KEY,
      tenant_id     INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      table_id      INT REFERENCES tables(id),
      user_id       INT REFERENCES users(id),
      status        VARCHAR(20) DEFAULT 'open',
      total         INT DEFAULT 0,
      guest_count   INT DEFAULT 1,
      note          TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      closed_at     TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    -- ============================================
    -- 6. ORDER ITEMS (Món trong đơn)
    -- ============================================
    CREATE TABLE IF NOT EXISTS order_items (
      id            SERIAL PRIMARY KEY,
      order_id      INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id  INT REFERENCES menu_items(id),
      name          VARCHAR(255) NOT NULL,
      price         INT NOT NULL,
      quantity      INT DEFAULT 1,
      note          TEXT,
      status        VARCHAR(20) DEFAULT 'pending',
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

    -- ============================================
    -- 7. EMPLOYEES (Nhân viên — mở rộng từ users)
    -- ============================================
    CREATE TABLE IF NOT EXISTS employees (
      id            SERIAL PRIMARY KEY,
      tenant_id     INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id       INT REFERENCES users(id),
      name          VARCHAR(255) NOT NULL,
      phone         VARCHAR(20),
      position      VARCHAR(50) NOT NULL,
      hourly_wage   INT DEFAULT 0,
      start_date    DATE,
      is_active     BOOLEAN DEFAULT true,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);

    -- ============================================
    -- 8. CUSTOMERS (Khách hàng thân thiết)
    -- ============================================
    CREATE TABLE IF NOT EXISTS customers (
      id            SERIAL PRIMARY KEY,
      tenant_id     INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name          VARCHAR(255) NOT NULL,
      phone         VARCHAR(20),
      birthday      VARCHAR(10),
      tier          VARCHAR(20) DEFAULT 'Đồng',
      points        INT DEFAULT 0,
      total_spent   INT DEFAULT 0,
      visit_count   INT DEFAULT 0,
      last_visit    TIMESTAMP,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
  `)

  console.log('✅ All tables created successfully!')
  await pool.end()
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
