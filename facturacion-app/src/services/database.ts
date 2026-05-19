import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, Cliente, Producto, FacturaCompra, FacturaVenta } from '../types';

const KEYS = {
  USUARIOS: '@facturacion_usuarios',
  CLIENTES: '@facturacion_clientes',
  PRODUCTOS: '@facturacion_productos',
  FACTURAS_COMPRA: '@facturacion_compras',
  FACTURAS_VENTA: '@facturacion_ventas',
  SESION_ACTUAL: '@facturacion_sesion',
};

// Datos iniciales de demostración
const usuariosIniciales: Usuario[] = [
  {
    id: '1',
    nombre: 'Admin',
    apellido: 'Principal',
    email: 'admin@facturacion.com',
    rol: 'administrador',
    activo: true,
  },
  {
    id: '2',
    nombre: 'Vendedor',
    apellido: 'Uno',
    email: 'vendedor@facturacion.com',
    rol: 'vendedor',
    activo: true,
  },
];

export const inicializarDatos = async () => {
  try {
    const usuarios = await AsyncStorage.getItem(KEYS.USUARIOS);
    if (!usuarios) {
      await AsyncStorage.setItem(KEYS.USUARIOS, JSON.stringify(usuariosIniciales));
    }
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
};

// Autenticación
export const login = async (email: string, password: string): Promise<Usuario | null> => {
  try {
    // En producción, esto debería validar contra una API
    // Para demo, usamos credenciales hardcodeadas
    const usuarios = await AsyncStorage.getItem(KEYS.USUARIOS);
    const listaUsuarios: Usuario[] = usuarios ? JSON.parse(usuarios) : usuariosIniciales;
    
    // Demo: aceptar cualquier email que coincida con los usuarios iniciales
    const usuario = listaUsuarios.find(u => u.email === email && u.activo);
    
    if (usuario) {
      const sesion = {
        usuario,
        token: `token_${Date.now()}`,
        fechaInicio: new Date().toISOString(),
      };
      await AsyncStorage.setItem(KEYS.SESION_ACTUAL, JSON.stringify(sesion));
      return usuario;
    }
    
    return null;
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.SESION_ACTUAL);
  } catch (error) {
    console.error('Error en logout:', error);
  }
};

export const obtenerSesionActual = async (): Promise<any | null> => {
  try {
    const sesion = await AsyncStorage.getItem(KEYS.SESION_ACTUAL);
    return sesion ? JSON.parse(sesion) : null;
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  }
};

// Clientes
export const obtenerClientes = async (): Promise<Cliente[]> => {
  try {
    const clientes = await AsyncStorage.getItem(KEYS.CLIENTES);
    return clientes ? JSON.parse(clientes) : [];
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

export const guardarCliente = async (cliente: Cliente): Promise<boolean> => {
  try {
    const clientes = await obtenerClientes();
    const index = clientes.findIndex(c => c.id === cliente.id);
    
    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.push(cliente);
    }
    
    await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes));
    return true;
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    return false;
  }
};

export const eliminarCliente = async (id: string): Promise<boolean> => {
  try {
    const clientes = await obtenerClientes();
    const filtrados = clientes.filter(c => c.id !== id);
    await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(filtrados));
    return true;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return false;
  }
};

export const buscarClientes = async (termino: string, tipo: 'nombre' | 'ci'): Promise<Cliente[]> => {
  try {
    const clientes = await obtenerClientes();
    const terminoLower = termino.toLowerCase();
    
    if (tipo === 'ci') {
      return clientes.filter(c => c.ci.toLowerCase().includes(terminoLower));
    } else {
      return clientes.filter(c => 
        c.nombre.toLowerCase().includes(terminoLower) || 
        c.apellidos.toLowerCase().includes(terminoLower)
      );
    }
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    return [];
  }
};

// Productos / Inventario
export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const productos = await AsyncStorage.getItem(KEYS.PRODUCTOS);
    return productos ? JSON.parse(productos) : [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

export const guardarProducto = async (producto: Producto): Promise<boolean> => {
  try {
    const productos = await obtenerProductos();
    const index = productos.findIndex(p => p.id === producto.id);
    
    if (index >= 0) {
      productos[index] = producto;
    } else {
      productos.push(producto);
    }
    
    await AsyncStorage.setItem(KEYS.PRODUCTOS, JSON.stringify(productos));
    return true;
  } catch (error) {
    console.error('Error al guardar producto:', error);
    return false;
  }
};

export const actualizarStock = async (productoId: string, cantidad: number): Promise<boolean> => {
  try {
    const productos = await obtenerProductos();
    const index = productos.findIndex(p => p.id === productoId);
    
    if (index >= 0) {
      productos[index].stock += cantidad;
      await AsyncStorage.setItem(KEYS.PRODUCTOS, JSON.stringify(productos));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    return false;
  }
};

// Facturas de Compra
export const obtenerFacturasCompra = async (): Promise<FacturaCompra[]> => {
  try {
    const facturas = await AsyncStorage.getItem(KEYS.FACTURAS_COMPRA);
    return facturas ? JSON.parse(facturas) : [];
  } catch (error) {
    console.error('Error al obtener facturas de compra:', error);
    return [];
  }
};

export const guardarFacturaCompra = async (factura: FacturaCompra): Promise<boolean> => {
  try {
    const facturas = await obtenerFacturasCompra();
    facturas.push(factura);
    await AsyncStorage.setItem(KEYS.FACTURAS_COMPRA, JSON.stringify(facturas));
    
    // Actualizar stock de productos
    for (const item of factura.productos) {
      await actualizarStock(item.productoId, item.cantidad);
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar factura de compra:', error);
    return false;
  }
};

// Facturas de Venta
export const obtenerFacturasVenta = async (): Promise<FacturaVenta[]> => {
  try {
    const facturas = await AsyncStorage.getItem(KEYS.FACTURAS_VENTA);
    return facturas ? JSON.parse(facturas) : [];
  } catch (error) {
    console.error('Error al obtener facturas de venta:', error);
    return [];
  }
};

export const guardarFacturaVenta = async (factura: FacturaVenta): Promise<boolean> => {
  try {
    const facturas = await obtenerFacturasVenta();
    facturas.push(factura);
    await AsyncStorage.setItem(KEYS.FACTURAS_VENTA, JSON.stringify(facturas));
    
    // Reducir stock de productos (solo si no es cotización)
    if (factura.tipoFactura !== 'cotizacion') {
      for (const item of factura.productos) {
        await actualizarStock(item.productoId, -item.cantidad);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar factura de venta:', error);
    return false;
  }
};

export const anularFacturaVenta = async (id: string): Promise<boolean> => {
  try {
    const facturas = await obtenerFacturasVenta();
    const index = facturas.findIndex(f => f.id === id);
    
    if (index >= 0) {
      facturas[index].estado = 'anulada';
      
      // Revertir stock
      for (const item of facturas[index].productos) {
        await actualizarStock(item.productoId, item.cantidad);
      }
      
      await AsyncStorage.setItem(KEYS.FACTURAS_VENTA, JSON.stringify(facturas));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al anular factura:', error);
    return false;
  }
};

// Utilidades
export const generarId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generarNumeroFactura = (prefijo: string = 'FAC'): string => {
  const fecha = new Date();
  const year = fecha.getFullYear().toString().substr(-2);
  const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefijo}-${year}${month}-${random}`;
};
