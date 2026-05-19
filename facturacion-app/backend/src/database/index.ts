import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const initDatabase = async () => {
  // Tabla de usuarios
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendedor')),
      full_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de clientes
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      ci VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de productos
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      cost DECIMAL(10, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de facturas
  await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('venta', 'compra', 'cotizacion')),
      customer_id INTEGER REFERENCES customers(id),
      user_id INTEGER REFERENCES users(id),
      subtotal DECIMAL(10, 2) NOT NULL,
      tax DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(20) CHECK (payment_method IN ('efectivo', 'tarjeta', 'mixto')),
      status VARCHAR(20) DEFAULT 'activa' CHECK (status IN ('activa', 'anulada')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de detalles de factura
  await query(`
    CREATE TABLE IF NOT EXISTS invoice_details (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL
    )
  `);

  // Insertar usuario admin por defecto (password: admin123)
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await query(`
    INSERT INTO users (username, password, role, full_name)
    VALUES ('admin', $1, 'admin', 'Administrador Principal')
    ON CONFLICT (username) DO NOTHING
  `, [hashedPassword]);

  console.log('✅ Base de datos inicializada correctamente');
};

export default pool;
