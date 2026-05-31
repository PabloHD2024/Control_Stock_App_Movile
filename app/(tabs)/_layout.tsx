import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

export default function TabsLayout() {
  const { role, signOut } = useAuth(); // Importamos signOut del contexto

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#007bff', 
        headerShown: true,
        // Este botón aparecerá arriba a la derecha en todas las pestañas de forma lógica
        headerRight: () => (
          <TouchableOpacity 
            onPress={signOut} 
            style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={{ color: '#dc3545', marginLeft: 4, fontWeight: '600', fontSize: 14 }}>Salir</Text>
          </TouchableOpacity>
        )
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Escanear QR',
          tabBarIcon: ({ color }) => <Ionicons name="qr-code-outline" size={24} color={color} />
        }}     
      />
      <Tabs.Screen 
        name="admin" 
        options={{ 
          title: 'Alta de Equipo',
          href: role === 'admin' ? '/admin' : null, 
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={24} color={color} />
        }} 
      />
      <Tabs.Screen
        name="usuarios"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{
          title: 'Movimientos',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}