import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { styles } from '../styles/styles';
import { getDB } from '../../lib/database';
import CustomHeader from '../customHeader';
import { useFocusEffect } from 'expo-router';

export default function MovimientosScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovimientos = async () => {
    try {
      const db = await getDB();
      
      // Hacemos un LEFT JOIN para traer los datos del equipo vinculados al movimiento
      const data: any[] = await db.getAllAsync(`
        SELECT 
          l.id,
          l.equipment_id,
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
      <View style={styles.center_tab_movimientos}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container_tab_movimientos}>
      <CustomHeader title="Movimientos" />
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
                S/N: {item.equipo_serie ? item.equipo_serie : `Equipo No Encontrado (ID: ${item.equipment_id})`}
              </Text>
              <Text style={styles.date_tab_movimientos}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'S/F'}
              </Text>
            </View>
            
            <Text style={styles.model_tab_movimientos}>
              {item.equipo_modelo ? item.equipo_modelo : 'Sin especificación de modelo'}
            </Text>
            
            <View style={styles.detailsRow_tab_movimientos}>
              <Text style={styles.detailText_tab_movimientos}>
                📍 Ubicación: {item.previous_location || 'Depósito'} ➔ <Text style={{ fontWeight: 'bold' }}>{item.new_location}</Text>
              </Text>
              <Text style={styles.detailText_tab_movimientos}>
                🔢 Cont: {item.previous_counter ?? 0} ➔ <Text style={{ fontWeight: 'bold' }}>{item.new_counter ?? 0}</Text>
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}