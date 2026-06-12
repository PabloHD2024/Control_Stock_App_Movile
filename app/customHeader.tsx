import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
}

export default function CustomHeader({ title }: HeaderProps) {
  const { logoutLocal, session } = useAuth();
  const insets = useSafeAreaInsets();

  // Mostrar solo la parte antes del @ como nombre de usuario
  const userName = session?.user?.email?.split('@')[0] ?? '';

  return (
    <View style={[style.container, { paddingTop: insets.top + 10 }]}>
      <Text style={style.title}>{title}</Text>

      <View style={style.rightSection}>
        {/* Nombre del usuario */}
        {!!userName && (
          <View style={style.userBadge}>
            <Ionicons name="person-circle-outline" size={15} color="#c9d4f5" />
            <Text style={style.userName} numberOfLines={1}>{userName}</Text>
          </View>
        )}

        {/* Botón salir */}
        <TouchableOpacity style={style.logoutBtn} onPress={async () => await logoutLocal()}>
          <Ionicons name="log-out" size={18} color="#fff" />
          <Text style={style.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    elevation: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    maxWidth: 120,
  },
  userName: {
    color: '#c9d4f5',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#ff0019',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
    gap: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
