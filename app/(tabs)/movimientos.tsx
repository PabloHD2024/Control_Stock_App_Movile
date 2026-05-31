import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function MovimientosScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovimientos = async () => {
  try {
    const { data, error } = await supabase
      .from('equipment_logs')
      .select(`
        id,
        created_at,
        previous_location,
        new_location,
        previous_counter,
        new_counter,
        equipos!equipment_id ( serie, modelo ) 
      `) // <-- NOTA: El !equipment_id le dice explícitamente a Supabase qué clave foránea usar
      .order('created_at', { ascending: false });

    if (error) throw error;
    setLogs(data || []);
  } catch (err: any) {
    console.error("Error obteniendo movimientos:", err.message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovimientos();
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007bff" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Movimientos</Text>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay movimientos registrados.</Text>}
        // Reemplaza el renderItem dentro de tu FlatList en movimientos.tsx
renderItem={({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      
      <Text style={styles.serie}>
        S/N: {item.equipos?.serie ? item.equipos.serie : `Equipo Eliminado (ID: ${item.equipment_id})`}
      </Text>
      <Text style={styles.date}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'S/F'}
      </Text>
    </View>
    
    {/* Agregamos la validación ?. para el modelo */}
    <Text style={styles.model}>
      {item.equipos?.modelo ? item.equipos.modelo : 'Sin especificación de modelo'}
    </Text>
    
    <View style={styles.detailsRow}>
      <Text style={styles.detailText}>
        📍 Ubicación: {item.previous_location || 'Depósito'} ➔ <Text style={{fontWeight: 'bold'}}>{item.new_location}</Text>
      </Text>
      <Text style={styles.detailText}>
        🔢 Cont: {item.previous_counter ?? 0} ➔ <Text style={{fontWeight: 'bold'}}>{item.new_counter ?? 0}</Text>
      </Text>
    </View>
  </View>
)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', paddingHorizontal: 15, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#6c757d', marginTop: 30, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e3e6ec' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  serie: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  date: { fontSize: 12, color: '#6c757d' },
  model: { fontSize: 14, color: '#495057', marginBottom: 8 },
  detailsRow: { borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 8, marginTop: 4 },
  detailText: { fontSize: 13, color: '#212529', marginBottom: 2 }
});