import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AppDataProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppDataProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AppDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
