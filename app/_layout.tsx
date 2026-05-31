import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Averiguamos si el usuario está actualmente en las pantallas de adentro (las que están en la carpeta tabs)
    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      // Si NO hay sesión y quiere entrar a las pestañas, lo pateamos al Login
      router.replace('/login'); 
    } else if (session && !inAuthGroup) {
      // Si SÍ hay sesión y está en el login, lo mandamos directo al Escáner
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Definimos las rutas del Stack de navegación
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-equipment" options={{ headerShown: true, title: 'Nuevo Equipo' }} />
    </Stack>
  );
}

// El componente principal envuelve todo con el proveedor de autenticación
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}