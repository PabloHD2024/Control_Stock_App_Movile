import React, { useCallback, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { getDB } from '../../lib/database';
import CustomHeader from '../customHeader';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MovimientosScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovimientos = async () => {
    try {
      const db = await getDB();
      const data: any[] = await db.getAllAsync(`
        SELECT 
          l.id,
          l.equipment_id,
          l.usuario_email,
          l.previous_location,
          l.new_location,
          l.previous_counter,
          l.new_counter,
          l.created_at,
          e.serie AS equipo_serie,
          e.modelo AS equipo_modelo
        FROM equipment_logs l
        LEFT JOIN equipos e ON l.equipment_id = e.id
        ORDER BY l.created_at DESC
      `);
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error obteniendo movimientos locales:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMovimientos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovimientos();
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
      <CustomHeader title="Movimientos" />
      <Text style={s.title}>Historial de Movimientos</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={48} color="#ced4da" />
            <Text style={s.emptyText}>No hay movimientos registrados.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            {/* Encabezado: serie + fecha */}
            <View style={s.cardHeader}>
              <Text style={s.serie}>
                S/N: {item.equipo_serie ?? `ID: ${item.equipment_id}`}
              </Text>
              <Text style={s.date}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'S/F'}
              </Text>
            </View>

            <Text style={s.model}>
              {item.equipo_modelo ?? 'Sin especificación de modelo'}
            </Text>

            {/* Movimiento de ubicación */}
            <View style={s.detailsRow}>
              <Ionicons name="location-outline" size={14} color="#6c757d" />
              <Text style={s.detailText}>
                {item.previous_location ?? 'Depósito'}
                {'  ➔  '}
                <Text style={{ fontWeight: 'bold', color: '#0c2b8f' }}>{item.new_location}</Text>
              </Text>
            </View>

            {/* Movimiento de contador */}
            <View style={s.detailsRow}>
              <Ionicons name="calculator-outline" size={14} color="#6c757d" />
              <Text style={s.detailText}>
                Cont: {item.previous_counter ?? 0}
                {'  ➔  '}
                <Text style={{ fontWeight: 'bold' }}>{item.new_counter ?? 0}</Text>
              </Text>
            </View>

            {/* ✅ Usuario que realizó el movimiento */}
            {!!item.usuario_email && (
              <View style={s.userRow}>
                <Ionicons name="person-outline" size={13} color="#adb5bd" />
                <Text style={s.userText}>{item.usuario_email}</Text>
              </View>
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
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 15,
    marginTop: 14,
    marginBottom: 8,
  },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#6c757d', fontSize: 15, marginTop: 12, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e3e6ec',
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  serie: { fontSize: 14, fontWeight: 'bold', color: '#0c2b8f', flex: 1 },
  date: { fontSize: 11, color: '#6c757d' },
  model: { fontSize: 12, color: '#495057', marginBottom: 8 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  detailText: { fontSize: 13, color: '#495057', flex: 1 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  userText: { fontSize: 11, color: '#adb5bd', fontStyle: 'italic' },
});
