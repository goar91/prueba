import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CrearVentaScreenProps {
  navigation: any;
}

export default function CrearVentaScreen({ navigation }: CrearVentaScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Nueva Venta/Factura</Text>
    </View>
  );
}

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
