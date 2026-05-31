import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { styles } from '../styles/styles';

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
    return <View style={styles.center_tab_movimientos}><ActivityIndicator size="large" color="#007bff" /></View>;
  }

  return (
    <View style={styles.container_tab_movimientos}>
      <Text style={styles.title_tab_movimientos}>Historial de Movimientos</Text>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty_tab_movimientos}>No hay movimientos registrados.</Text>}

renderItem={({ item }) => (
  <View style={styles.card_tab_movimientos}>
    <View style={styles.cardHeader_tab_movimientos}>
      
      <Text style={styles.serie_tab_movimientos}>
        S/N: {item.equipos?.serie ? item.equipos.serie : `Equipo Eliminado (ID: ${item.equipment_id})`}
      </Text>
      <Text style={styles.date_tab_movimientos}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'S/F'}
      </Text>
    </View>
    
    {/* Agregamos la validación ?. para el modelo */}
    <Text style={styles.model_tab_movimientos}>
      {item.equipos?.modelo ? item.equipos.modelo : 'Sin especificación de modelo'}
    </Text>
    
    <View style={styles.detailsRow_tab_movimientos}>
      <Text style={styles.detailText_tab_movimientos}>
        📍 Ubicación: {item.previous_location || 'Depósito'} ➔ <Text style={{fontWeight: 'bold'}}>{item.new_location}</Text>
      </Text>
      <Text style={styles.detailText_tab_movimientos}>
        🔢 Cont: {item.previous_counter ?? 0} ➔ <Text style={{fontWeight: 'bold'}}>{item.new_counter ?? 0}</Text>
      </Text>
    </View>
  </View>
)}
      />
    </View>
  );
}