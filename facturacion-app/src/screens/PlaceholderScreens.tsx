// Placeholder screens - Se pueden implementar completamente según necesidad

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const createPlaceholderScreen = (title: string) => {
  return function PlaceholderScreen({ navigation }: any) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
      </View>
    );
  };
};

export const ProductosScreen = createPlaceholderScreen('Gestión de Productos');
export const FacturasCompraScreen = createPlaceholderScreen('Facturas de Compra');
export const ReportesScreen = createPlaceholderScreen('Reportes y Estadísticas');
export const HistorialVentasScreen = createPlaceholderScreen('Historial de Ventas');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
