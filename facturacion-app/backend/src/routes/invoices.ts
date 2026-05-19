import { Router } from 'express';
import { query } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Generar número de factura único
const generateInvoiceNumber = (type: string) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const prefix = type === 'venta' ? 'VTA' : type === 'compra' ? 'CMP' : 'COT';
  return `${prefix}-${year}${month}-${random}`;
};

// Obtener todas las facturas
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { type, status } = req.query;
    let sql = `
      SELECT i.*, c.first_name, c.last_name, c.ci, u.username as created_by
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND i.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      sql += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una factura específica con sus detalles
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const invoiceResult = await query(`
      SELECT i.*, c.first_name, c.last_name, c.ci, c.email, c.phone, c.address, u.username as created_by
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const detailsResult = await query(`
      SELECT d.*, p.name as product_name
      FROM invoice_details d
      LEFT JOIN products p ON d.product_id = p.id
      WHERE d.invoice_id = $1
    `, [id]);

    res.json({
      ...invoiceResult.rows[0],
      details: detailsResult.rows
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear factura (venta, compra o cotización)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { type, customer_id, items, payment_method, notes } = req.body;

    if (!type || !items || items.length === 0) {
      return res.status(400).json({ error: 'Tipo y items son requeridos' });
    }

    if (!['venta', 'compra', 'cotizacion'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de factura inválido' });
    }

    // Calcular totales
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unit_price;
    }

    const tax = type === 'cotizacion' ? 0 : subtotal * 0.13; // 13% IVA
    const total = subtotal + tax;

    // Iniciar transacción
    const client = await (await import('../database')).default.connect();
    
    try {
      await client.query('BEGIN');

      const invoiceNumber = generateInvoiceNumber(type);

      // Insertar factura
      const invoiceResult = await client.query(`
        INSERT INTO invoices (invoice_number, type, customer_id, user_id, subtotal, tax, total, payment_method, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [invoiceNumber, type, customer_id || null, req.user?.id, subtotal, tax, total, payment_method || null, notes]);

      const invoice = invoiceResult.rows[0];

      // Insertar detalles y actualizar stock
      for (const item of items) {
        await client.query(`
          INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, total)
          VALUES ($1, $2, $3, $4, $5)
        `, [invoice.id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);

        // Actualizar stock solo para ventas y compras (no cotizaciones)
        if (type !== 'cotizacion') {
          if (type === 'venta') {
            await client.query(`
              UPDATE products SET stock = stock - $1 WHERE id = $2
            `, [item.quantity, item.product_id]);
          } else if (type === 'compra') {
            await client.query(`
              UPDATE products SET stock = stock + $1 WHERE id = $2
            `, [item.quantity, item.product_id]);
          }
        }
      }

      await client.query('COMMIT');

      // Obtener factura completa con detalles
      const fullInvoice = await client.query(`
        SELECT i.*, c.first_name, c.last_name, c.ci
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = $1
      `, [invoice.id]);

      const details = await client.query(`
        SELECT d.*, p.name as product_name
        FROM invoice_details d
        LEFT JOIN products p ON d.product_id = p.id
        WHERE d.invoice_id = $1
      `, [invoice.id]);

      res.status(201).json({
        ...fullInvoice.rows[0],
        details: details.rows
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error al crear factura:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Número de factura ya existe' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Anular factura (solo admin)
router.patch('/:id/anular', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden anular facturas' });
    }

    const result = await query(`
      UPDATE invoices SET status = 'anulada' WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ message: 'Factura anulada exitosamente', invoice: result.rows[0] });
  } catch (error) {
    console.error('Error al anular factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
