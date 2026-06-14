import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() { // Componente separado para manejar la navegación y la lógica de autenticación
  const { session, loading } = useAuth(); // Obtiene la sesión y el estado de carga del contexto de autenticación
  const segments = useSegments(); // Obtiene los segmentos de la ruta actual para determinar en qué página estamos
  const router = useRouter(); // Hook para manejar la navegación programática 

  React.useEffect(() => {
    if (loading) return; // Espera a que se cargue la sesión
    const inLoginRoute = segments[0] === 'login'; // Verifica si el primer segmento es 'login'
    if (!session && !inLoginRoute) {    // Si no hay sesión y no estamos en la ruta de login, redirige a login
      router.replace('/login'); // Reemplaza la ruta actual para evitar que el usuario pueda volver atrás
    } else if (session && inLoginRoute) { // Si hay sesión y estamos en la ruta de login, redirige a la página principal
      router.replace('/(tabs)'); // Reemplaza la ruta actual para evitar que el usuario pueda volver atrás
    }
  }, [session, loading, segments]); // Agrega 'loading' a las dependencias para manejar el estado de carga

  if (loading) { // Muestra un indicador de carga mientras se verifica la sesión
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create_equipment" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ headerShown: false }} />
      <Stack.Screen name="lista_usuarios" options={{ headerShown: false }} />
    </Stack>
  );
}
