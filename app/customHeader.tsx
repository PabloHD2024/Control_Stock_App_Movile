import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
}

export default function CustomHeader({ title }: HeaderProps) {
  const { logoutLocal } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[style.container, { paddingTop: insets.top + 10 }]}>
      <Text style={style.title}>{title}</Text>
      <TouchableOpacity style={style.logoutBtn} onPress={async () => await logoutLocal()}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={style.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#080a79',
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#ff0019',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
