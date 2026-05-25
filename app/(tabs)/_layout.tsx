import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  const { role } = useAuth();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007bff', headerShown: true }}>
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
          href: role === 'admin' ? '/admin' : null, // Oculta la pestaña si no es Admin
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