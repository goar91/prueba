import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AppContext';
import ActivityIndicator from 'react-native/Libraries/Components/ActivityIndicator/ActivityIndicator';
import View from 'react-native/Libraries/Components/View/View';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ClientesScreen from '../screens/ClientesScreen';
import CrearClienteScreen from '../screens/CrearClienteScreen';
import InventarioScreen from '../screens/InventarioScreen';
import CrearVentaScreen from '../screens/CrearVentaScreen';
import {
  ProductosScreen,
  FacturasCompraScreen,
  ReportesScreen,
  HistorialVentasScreen,
} from '../screens/PlaceholderScreens';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Clientes: undefined;
  CrearCliente: { cliente?: any };
  Inventario: undefined;
  CrearVenta: undefined;
  Productos: undefined;
  FacturasCompra: undefined;
  Reportes: undefined;
  HistorialVentas: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen 
        name="Clientes" 
        component={ClientesScreen}
        options={{ title: 'Clientes' }}
      />
      <Stack.Screen 
        name="CrearCliente" 
        component={CrearClienteScreen}
        options={{ title: 'Nuevo Cliente' }}
      />
      <Stack.Screen 
        name="Inventario" 
        component={InventarioScreen}
        options={{ title: 'Inventario' }}
      />
      <Stack.Screen 
        name="CrearVenta" 
        component={CrearVentaScreen}
        options={{ title: 'Nueva Venta' }}
      />
      <Stack.Screen 
        name="Productos" 
        component={ProductosScreen}
        options={{ title: 'Productos' }}
      />
      <Stack.Screen 
        name="FacturasCompra" 
        component={FacturasCompraScreen}
        options={{ title: 'Facturas de Compra' }}
      />
      <Stack.Screen 
        name="Reportes" 
        component={ReportesScreen}
        options={{ title: 'Reportes' }}
      />
      <Stack.Screen 
        name="HistorialVentas" 
        component={HistorialVentasScreen}
        options={{ title: 'Historial de Ventas' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {usuario ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
