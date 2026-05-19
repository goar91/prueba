import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth, useAppData } from '../../context/AppContext';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { usuario, logout, esAdministrador } = useAuth();
  const { productos, facturasVenta } = useAppData();

  const handleLogout = async () => {
    await logout();
  };

  const stockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;
  const ventasHoy = facturasVenta.filter(f => {
    const fechaFactura = new Date(f.fechaVenta);
    const hoy = new Date();
    return fechaFactura.toDateString() === hoy.toDateString() && f.estado === 'activa';
  }).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sistema de Facturación</Text>
          <Text style={styles.subtitle}>
            Bienvenido, {usuario?.nombre} {usuario?.apellido}
          </Text>
          <Text style={styles.role}>
            Rol: {usuario?.rol === 'administrador' ? 'Administrador' : 'Vendedor'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Resumen */}
        <View style={styles.resumenContainer}>
          <Text style={styles.sectionTitle}>Resumen del Día</Text>
          <View style={styles.resumenGrid}>
            <View style={styles.resumenCard}>
              <Text style={styles.resumenNumero}>{ventasHoy}</Text>
              <Text style={styles.resumenLabel}>Ventas Hoy</Text>
            </View>
            <View style={styles.resumenCard}>
              <Text style={[styles.resumenNumero, stockBajo > 0 && styles.alerta]}>{stockBajo}</Text>
              <Text style={styles.resumenLabel}>Stock Bajo</Text>
            </View>
          </View>
        </View>

        {/* Menú Principal */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Menú Principal</Text>
          
          {/* Opciones disponibles para todos los roles */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('CrearVenta')}
          >
            <Text style={styles.menuIcon}>📝</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Nueva Venta / Factura</Text>
              <Text style={styles.menuDescription}>
                Crear factura, consumidor final o cotización
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Inventario')}
          >
            <Text style={styles.menuIcon}>📦</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Inventario</Text>
              <Text style={styles.menuDescription}>
                Consultar productos y stock disponible
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Clientes')}
          >
            <Text style={styles.menuIcon">👥</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Clientes</Text>
              <Text style={styles.menuDescription}>
                Gestionar clientes - Buscar por nombre o CI
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {/* Opciones solo para administrador */}
          {esAdministrador() && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Productos')}
              >
                <Text style={styles.menuIcon}>🛍️</Text>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Productos</Text>
                  <Text style={styles.menuDescription}>
                    Gestionar catálogo de productos
                  </Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('FacturasCompra')}
              >
                <Text style={styles.menuIcon}>🛒</Text>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Facturas de Compra</Text>
                  <Text style={styles.menuDescription}>
                    Registrar compras a proveedores
                  </Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Reportes')}
              >
                <Text style={styles.menuIcon}>📊</Text>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Reportes</Text>
                  <Text style={styles.menuDescription}>
                    Ver estadísticas y reportes del sistema
                  </Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HistorialVentas')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Historial de Ventas</Text>
              <Text style={styles.menuDescription}>
                Consultar facturas emitidas
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    marginTop: 5,
  },
  role: {
    fontSize: 14,
    color: '#bbdefb',
    marginTop: 3,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resumenContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resumenGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  resumenCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumenNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  alerta: {
    color: '#f44336',
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
});
