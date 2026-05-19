// Tipos de datos para la aplicación de facturación

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'administrador' | 'vendedor';
  activo: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  apellidos: string;
  ci: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaRegistro: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoria?: string;
  fechaRegistro: string;
}

export interface FacturaCompra {
  id: string;
  numeroFactura: string;
  proveedor: string;
  ciProveedor?: string;
  productos: ItemFactura[];
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  fechaCompra: string;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  usuarioId: string;
}

export interface ItemFactura {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FacturaVenta {
  id: string;
  numeroFactura: string;
  clienteId: string;
  clienteNombre: string;
  clienteCI: string;
  productos: ItemFactura[];
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  fechaVenta: string;
  metodoPago: 'efectivo' | 'tarjeta' | 'mixto';
  pagoTarjeta?: number;
  pagoEfectivo?: number;
  tipoFactura: 'normal' | 'consumidor_final' | 'cotizacion';
  estado: 'activa' | 'anulada' | 'cotizacion';
  usuarioId: string;
  observaciones?: string;
}

export interface SesionUsuario {
  usuario: Usuario;
  token: string;
  fechaInicio: string;
}

export interface AppState {
  usuarioActual: Usuario | null;
  clientes: Cliente[];
  productos: Producto[];
  facturasCompra: FacturaCompra[];
  facturasVenta: FacturaVenta[];
}
