import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CrearClienteScreenProps {
  navigation: any;
  route?: any;
}

export default function CrearClienteScreen({ navigation, route }: CrearClienteScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Crear/Editar Cliente</Text>
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
