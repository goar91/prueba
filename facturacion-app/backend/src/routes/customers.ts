import { Router } from 'express';
import { query } from '../database';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// Obtener todos los clientes (todos los roles)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { search, ci } = req.query;
    let sql = 'SELECT * FROM customers';
    const params: any[] = [];

    if (ci) {
      sql += ' WHERE ci ILIKE $1';
      params.push(`%${ci}%`);
    } else if (search) {
      sql += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY last_name, first_name';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear cliente (todos los roles)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { ci, first_name, last_name, email, phone, address } = req.body;

    if (!ci || !first_name || !last_name) {
      return res.status(400).json({ error: 'CI, nombre y apellido son requeridos' });
    }

    const result = await query(
      `INSERT INTO customers (ci, first_name, last_name, email, phone, address) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [ci, first_name, last_name, email, phone, address]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El CI ya está registrado' });
    }
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cliente (solo admin)
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;

    const result = await query(
      `UPDATE customers 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [first_name, last_name, email, phone, address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar cliente (solo admin)
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
