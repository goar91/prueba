import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InventarioScreenProps {
  navigation: any;
}

export default function InventarioScreen({ navigation }: InventarioScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Inventario</Text>
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
