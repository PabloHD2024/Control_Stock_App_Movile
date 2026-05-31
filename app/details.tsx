import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import styles from './styles/styles';

export default function DetailsScreen() {
  const { id, serie } = useLocalSearchParams();
  const router = useRouter();
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados mapeados a tus columnas de Supabase
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState(''); // Columna 'estado'
  const [originLocationId, setOriginLocationId] = useState(''); // Columna 'lugar_origen_id'
  const [destinationLocationId, setDestinationLocationId] = useState(''); // Columna 'lugar_destino_id'
  const [inputCounter, setInputCounter] = useState(''); // Columna 'contador_entrada'
  const [outputCounter, setOutputCounter] = useState(''); // Columna 'contador_salida'
  const [originalEquipment, setOriginalEquipment] = useState<any>(null);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id, serie]);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      let query = supabase.from('equipos').select('*');

      if (id) {
        query = query.eq('id', parseInt(id as string, 10));
      } else if (serie) {
        query = query.eq('serie', (serie as string).trim());
      } else {
        return;
      }

      const { data, error } = await query.single();

      if (error || !data) {
        console.log("Error de Supabase al traer detalles:", error);
        Alert.alert('Error', 'No se pudieron recuperar los datos del activo.');
        router.back();
        return;
      }

      // Guardamos el registro original y seteamos los inputs con tus columnas reales
      setOriginalEquipment(data);
      setSerialNumber(data.serie || '');
      setModel(data.modelo || '');
      setStatus(data.estado || '');
      setOriginLocationId(data.lugar_origen_id ? data.lugar_origen_id.toString() : '');
      setDestinationLocationId(data.lugar_destino_id ? data.lugar_destino_id.toString() : '');
      setInputCounter(data.contador_entrada ? data.contador_entrada.toString() : '0');
      setOutputCounter(data.contador_output ? data.contador_salida.toString() : '0');
      
    } catch (err) {
      console.error("Error en fetchEquipmentDetails:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Validamos que el ID del cliente destino y el contador de salida tengan datos
    if (!destinationLocationId.trim() || !outputCounter.trim()) {
      return Alert.alert('Error', 'El ID de cliente destino y el contador de salida son obligatorios.');
    }

    setSubmitting(true);

    // Creamos el paquete de actualización mapeando exactamente tus columnas de Supabase
    const updatePayload: any = isAdmin 
      ? { 
          serie: serialNumber, 
          modelo: model, 
          estado: status,
          lugar_origen_id: originLocationId.trim() ? parseInt(originLocationId, 10) : null,
          lugar_destino_id: parseInt(destinationLocationId, 10), 
          contador_entrada: parseInt(inputCounter, 10), 
          contador_salida: parseInt(outputCounter, 10),
          ultimo_movimiento: new Date().toISOString()
        }
      : { 
          lugar_destino_id: parseInt(destinationLocationId, 10), 
          contador_salida: parseInt(outputCounter, 10),
          ultimo_movimiento: new Date().toISOString()
        };

    try {
      const { error: updateError } = await supabase
        .from('equipos')
        .update(updatePayload)
        .eq('id', originalEquipment.id);

      if (updateError) throw updateError;

      // Intentar guardar en la tabla histórica si la tenés configurada
      try {
        await supabase.from('equipment_logs').insert({
          equipment_id: originalEquipment.id,
          user_id: user?.id,
          previous_location: originalEquipment.lugar_destino_id, 
          new_location: parseInt(destinationLocationId, 10),
          previous_counter: originalEquipment.contador_salida,
          new_counter: parseInt(outputCounter, 10)
        });
      } catch (logError) {
        console.log("Nota: No se guardó el log histórico (revisar nombres de columnas de logs):", logError);
      }

      Alert.alert('Éxito', 'Cambios guardados con trazabilidad informática.', [
        { text: 'Ver movimientos', 
          onPress: () => {
            router.push('movimientos');
          }
        },
        {
          text: 'Volver al escaner',
          onPress: () => router.push('/(tabs)')
        }
      ]);
    } catch (err: any) {
      Alert.alert('Error al actualizar', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center_D_S}><ActivityIndicator size="large" color="#007bff" /></View>;
  }

  return (
    <ScrollView style={styles.container_D_S} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.roleNotice_D_S}>Modo de acceso: {isAdmin ? 'Administrador' : 'Usuario General'}</Text>
      
      <Text style={styles.label_D_S}>Nº de Serie</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={serialNumber} onChangeText={setSerialNumber} editable={isAdmin} />

      <Text style={styles.label_D_S}>Modelo</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={model} onChangeText={setModel} editable={isAdmin} />

      <Text style={styles.label_D_S}>Estado del Equipo</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={status} onChangeText={setStatus} editable={isAdmin} placeholder="Ej: Activo, En reparación" />

      <Text style={styles.label_D_S}>Contador de Entrada (Inicial)</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={inputCounter} onChangeText={setInputCounter} editable={isAdmin} keyboardType="numeric" />

      <Text style={styles.label_D_S}>ID Cliente de Origen</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={originLocationId} onChangeText={setOriginLocationId} editable={isAdmin} keyboardType="numeric" placeholder="ID Cliente Origen" />

      <View style={styles.separator_D_S} />

      {/* Secciones editables por todos (Logística de campo) */}
      <Text style={styles.label_D_S}>ID Cliente de Destino (Relacionar con Cliente)</Text>
      <TextInput style={styles.input_D_S} value={destinationLocationId} onChangeText={setDestinationLocationId} keyboardType="numeric" placeholder="Ingresá el ID numérico del cliente" />

      <Text style={styles.label_D_S}>Contador de Salida / Cierre Actual</Text>
      <TextInput style={styles.input_D_S} value={outputCounter} onChangeText={setOutputCounter} keyboardType="numeric" placeholder="Contador actual de la impresora" />

      <TouchableOpacity style={styles.saveBtn_D_S} onPress={handleUpdate} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText_D_S}>Guardar Movimiento</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}