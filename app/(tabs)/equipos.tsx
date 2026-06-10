import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { getDB } from '../../lib/database';
import { useAuth } from '../../context/AuthContext';
import CustomHeader from '../customHeader';
import { Ionicons } from '@expo/vector-icons';

export default function EquiposScreen() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { session } = useAuth();
  const isAdmin = session?.user?.rol === 'admin';

  const fetchEquipos = async () => {
    try {
      const db = await getDB();
      const data: any[] = await db.getAllAsync(
        `SELECT * FROM equipos ORDER BY fecha_entrada DESC`
      );
      setEquipos(data || []);
      setFiltered(data || []);
    } catch (error: any) {
      console.error('Error al obtener equipos:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarga la lista cada vez que la pantalla toma foco (ej: al volver de details)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEquipos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEquipos();
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const q = text.trim().toLowerCase();
    if (!q) {
      setFiltered(equipos);
      return;
    }
    setFiltered(
      equipos.filter(
        (e) =>
          e.serie?.toLowerCase().includes(q) ||
          e.modelo?.toLowerCase().includes(q) ||
          e.estado?.toLowerCase().includes(q)
      )
    );
  };

  const handleShare = async (equipo: any) => {
    const mensaje =
      `📋 *Ficha de Equipo*\n` +
      `Serie: ${equipo.serie}\n` +
      `Modelo: ${equipo.modelo}\n` +
      `Estado: ${equipo.estado}\n` +
      `Contador Entrada: ${equipo.contador_entrada}\n` +
      `Contador Salida: ${equipo.contador_salida}\n` +
      `Fecha de Alta: ${equipo.fecha_entrada ? new Date(equipo.fecha_entrada).toLocaleDateString() : 'S/F'}`;

    try {
      await Share.share({ message: mensaje });
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo compartir la información.');
    }
  };

  const handleEdit = (equipo: any) => {
    router.push({ pathname: '/details', params: { id: equipo.id } });
  };

  const estadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'disponible': return '#28a745';
      case 'en reparación': return '#ffc107';
      case 'activo': return '#007bff';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <CustomHeader title="Equipos" />

      {/* Barra de búsqueda */}
      <View style={s.searchContainer}>
        <Ionicons name="search" size={18} color="#6c757d" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por serie, modelo o estado..."
          placeholderTextColor="#adb5bd"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#6c757d" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={s.counter}>
        {filtered.length} equipo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#ced4da" />
            <Text style={s.emptyText}>
              {search ? 'Sin resultados para esa búsqueda.' : 'No hay equipos registrados aún.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            {/* Encabezado de la card */}
            <View style={s.cardHeader}>
              <Text style={s.serie}>{item.serie}</Text>
              <View style={[s.estadoBadge, { backgroundColor: estadoColor(item.estado) }]}>
                <Text style={s.estadoText}>{item.estado}</Text>
              </View>
            </View>

            <Text style={s.modelo}>{item.modelo}</Text>

            {/* Contadores */}
            <View style={s.countersRow}>
              <View style={s.counterItem}>
                <Text style={s.counterLabel}>Entrada</Text>
                <Text style={s.counterValue}>{item.contador_entrada ?? 0}</Text>
              </View>
              <View style={s.counterDivider} />
              <View style={s.counterItem}>
                <Text style={s.counterLabel}>Salida</Text>
                <Text style={s.counterValue}>{item.contador_salida ?? 0}</Text>
              </View>
              <View style={s.counterDivider} />
              <View style={s.counterItem}>
                <Text style={s.counterLabel}>Alta</Text>
                <Text style={s.counterValue}>
                  {item.fecha_entrada ? new Date(item.fecha_entrada).toLocaleDateString() : 'S/F'}
                </Text>
              </View>
            </View>

            {/* Acciones */}
            <View style={s.actions}>
              <TouchableOpacity style={s.shareBtn} onPress={() => handleShare(item)}>
                <Ionicons name="share-social-outline" size={16} color="#007bff" />
                <Text style={s.shareBtnText}>Compartir</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity style={s.editBtn} onPress={() => handleEdit(item)}>
                  <Ionicons name="create-outline" size={16} color="#fff" />
                  <Text style={s.editBtnText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e3e6ec',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#333' },
  counter: { fontSize: 12, color: '#6c757d', marginHorizontal: 15, marginBottom: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#6c757d', fontSize: 15, marginTop: 12, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3e6ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serie: { fontSize: 16, fontWeight: 'bold', color: '#0c2b8f', flex: 1, marginRight: 8 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  estadoText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  modelo: { fontSize: 13, color: '#495057', marginBottom: 10 },
  countersRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  counterItem: { flex: 1, alignItems: 'center' },
  counterLabel: { fontSize: 10, color: '#6c757d', marginBottom: 2, textTransform: 'uppercase' },
  counterValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  counterDivider: { width: 1, backgroundColor: '#dee2e6', marginHorizontal: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  shareBtnText: { color: '#007bff', fontSize: 13, fontWeight: '600' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0c2b8f',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
