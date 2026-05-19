import { Router } from 'express';
import { query } from '../database';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// Obtener todos los productos (todos los roles)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM products';
    const params: any[] = [];

    if (search) {
      sql += ' WHERE name ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY name';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear producto (solo admin)
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { name, description, price, cost, stock, min_stock } = req.body;

    if (!name || !price || !cost) {
      return res.status(400).json({ error: 'Nombre, precio y costo son requeridos' });
    }

    const result = await query(
      `INSERT INTO products (name, description, price, cost, stock, min_stock) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, description, price, cost, stock || 0, min_stock || 10]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, cost, stock, min_stock } = req.body;

    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, cost = $4, stock = $5, min_stock = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, description, price, cost, stock, min_stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar stock (solo admin - para facturas de compra)
router.patch('/:id/stock', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' o 'remove'

    let sql = '';
    if (type === 'add') {
      sql = `UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
    } else if (type === 'remove') {
      sql = `UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
    } else {
      return res.status(400).json({ error: 'Tipo de operación inválido' });
    }

    const result = await query(sql, [quantity, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
