import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Cliente, Producto, FacturaCompra, FacturaVenta } from '../types';
import * as db from '../services/database';

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  esAdministrador: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarSesion();
  }, []);

  const cargarSesion = async () => {
    try {
      await db.inicializarDatos();
      const sesion = await db.obtenerSesionActual();
      if (sesion && sesion.usuario) {
        setUsuario(sesion.usuario);
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usuarioEncontrado = await db.login(email, password);
      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = async () => {
    await db.logout();
    setUsuario(null);
  };

  const esAdministrador = (): boolean => {
    return usuario?.rol === 'administrador';
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, esAdministrador }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Contexto para datos de la aplicación
interface AppDataContextType {
  clientes: Cliente[];
  productos: Producto[];
  facturasCompra: FacturaCompra[];
  facturasVenta: FacturaVenta[];
  cargarClientes: () => Promise<void>;
  cargarProductos: () => Promise<void>;
  cargarFacturasCompra: () => Promise<void>;
  cargarFacturasVenta: () => Promise<void>;
  guardarCliente: (cliente: Cliente) => Promise<boolean>;
  eliminarCliente: (id: string) => Promise<boolean>;
  guardarProducto: (producto: Producto) => Promise<boolean>;
  guardarFacturaCompra: (factura: FacturaCompra) => Promise<boolean>;
  guardarFacturaVenta: (factura: FacturaVenta) => Promise<boolean>;
  anularFacturaVenta: (id: string) => Promise<boolean>;
  buscarClientes: (termino: string, tipo: 'nombre' | 'ci') => Promise<Cliente[]>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [facturasCompra, setFacturasCompra] = useState<FacturaCompra[]>([]);
  const [facturasVenta, setFacturasVenta] = useState<FacturaVenta[]>([]);

  const cargarClientes = async () => {
    const data = await db.obtenerClientes();
    setClientes(data);
  };

  const cargarProductos = async () => {
    const data = await db.obtenerProductos();
    setProductos(data);
  };

  const cargarFacturasCompra = async () => {
    const data = await db.obtenerFacturasCompra();
    setFacturasCompra(data);
  };

  const cargarFacturasVenta = async () => {
    const data = await db.obtenerFacturasVenta();
    setFacturasVenta(data);
  };

  const guardarClienteWrapper = async (cliente: Cliente): Promise<boolean> => {
    const exito = await db.guardarCliente(cliente);
    if (exito) {
      await cargarClientes();
    }
    return exito;
  };

  const eliminarClienteWrapper = async (id: string): Promise<boolean> => {
    const exito = await db.eliminarCliente(id);
    if (exito) {
      await cargarClientes();
    }
    return exito;
  };

  const guardarProductoWrapper = async (producto: Producto): Promise<boolean> => {
    const exito = await db.guardarProducto(producto);
    if (exito) {
      await cargarProductos();
    }
    return exito;
  };

  const guardarFacturaCompraWrapper = async (factura: FacturaCompra): Promise<boolean> => {
    const exito = await db.guardarFacturaCompra(factura);
    if (exito) {
      await cargarFacturasCompra();
      await cargarProductos(); // Recargar por actualización de stock
    }
    return exito;
  };

  const guardarFacturaVentaWrapper = async (factura: FacturaVenta): Promise<boolean> => {
    const exito = await db.guardarFacturaVenta(factura);
    if (exito) {
      await cargarFacturasVenta();
      await cargarProductos(); // Recargar por actualización de stock
    }
    return exito;
  };

  const anularFacturaVentaWrapper = async (id: string): Promise<boolean> => {
    const exito = await db.anularFacturaVenta(id);
    if (exito) {
      await cargarFacturasVenta();
      await cargarProductos(); // Recargar por reversión de stock
    }
    return exito;
  };

  const buscarClientesWrapper = async (termino: string, tipo: 'nombre' | 'ci'): Promise<Cliente[]> => {
    return await db.buscarClientes(termino, tipo);
  };

  return (
    <AppDataContext.Provider
      value={{
        clientes,
        productos,
        facturasCompra,
        facturasVenta,
        cargarClientes,
        cargarProductos,
        cargarFacturasCompra,
        cargarFacturasVenta,
        guardarCliente: guardarClienteWrapper,
        eliminarCliente: eliminarClienteWrapper,
        guardarProducto: guardarProductoWrapper,
        guardarFacturaCompra: guardarFacturaCompraWrapper,
        guardarFacturaVenta: guardarFacturaVentaWrapper,
        anularFacturaVenta: anularFacturaVentaWrapper,
        buscarClientes: buscarClientesWrapper,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData debe usarse dentro de un AppDataProvider');
  }
  return context;
};
