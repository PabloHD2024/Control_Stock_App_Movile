import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDB } from '../lib/database';
import CustomHeader from './customHeader';
import { Ionicons } from '@expo/vector-icons';

export default function ListaUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const db = await getDB();
      const data: any[] = await db.getAllAsync(
        `SELECT id, email, rol FROM perfiles ORDER BY rol ASC, email ASC`
      );
      setUsuarios(data || []);
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUsuarios();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsuarios();
  };

  const handleDelete = (usuario: any) => {
    // Protección: no borrar el admin principal
    if (usuario.email === 'admin@stock.com') {
      return Alert.alert('Acción no permitida', 'El administrador principal no puede eliminarse.');
    }

    Alert.alert(
      'Eliminar usuario',
      `¿Estás seguro de eliminar a "${usuario.email}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDB();
              await db.runAsync(`DELETE FROM perfiles WHERE id = ?`, [usuario.id]);
              setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
            } catch (e: any) {
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
            }
          },
        },
      ]
    );
  };

  const rolColor = (rol: string) => (rol === 'admin' ? '#0c2b8f' : '#28a745');
  const rolLabel = (rol: string) => (rol === 'admin' ? 'Admin' : 'Usuario');

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <CustomHeader title="Lista de Usuarios" />

      <Text style={s.counter}>
        {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ced4da" />
            <Text style={s.emptyText}>No hay usuarios registrados.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardLeft}>
              <View style={[s.avatar, { backgroundColor: rolColor(item.rol) }]}>
                <Text style={s.avatarText}>{item.email[0].toUpperCase()}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.email} numberOfLines={1}>{item.email}</Text>
                <View style={[s.rolBadge, { backgroundColor: rolColor(item.rol) }]}>
                  <Text style={s.rolText}>{rolLabel(item.rol)}</Text>
                </View>
              </View>
            </View>

            {/* Solo mostrar botón eliminar si no es el admin principal */}
            {item.email !== 'admin@stock.com' && (
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={18} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  counter: { fontSize: 12, color: '#6c757d', marginHorizontal: 15, marginTop: 12, marginBottom: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#6c757d', fontSize: 15, marginTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e3e6ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  email: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  rolBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20 },
  rolText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 8 },
});
