import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0c2b8f',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e3e6ec',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 5,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Escanear', tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="equipos" options={{ title: 'Equipos', tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="movimientos" options={{ title: 'Movimientos', tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="clientes" options={{ title: 'Clientes', tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="admin" options={{ title: 'Alta Equipo', tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="usuarios" options={{ title: 'Usuarios', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
