import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import styles from './styles/styles';

export default function CreateEquipmentScreen() {
  const { serie } = useLocalSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Estados basados exactamente en tus columnas de 'equipos'
  const [serial, setSerial] = useState((serie as string) || '');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('Disponible');
  const [inputCounter, setInputCounter] = useState('');
  const [originId, setOriginId] = useState('');

  const handleCreate = async () => {
  if (!serial.trim() || !model.trim() || !inputCounter.trim()) {
    return Alert.alert('Error', 'Nº de Serie, Modelo y Contador de entrada son obligatorios.');
  }

  setSubmitting(true);

  try {
    const { error } = await supabase.from('equipos').insert([{serie: serial.trim().toUpperCase(),
      modelo: model.trim(),
      estado: status.trim(),
      contador_entrada: parseInt(inputCounter, 10),
      contador_salida: parseInt(inputCounter, 10), 
      lugar_origen_id: originId.trim() ? parseInt(originId, 10) : null,
      fecha_entrada: new Date().toISOString(),
    }]);

    if (error) throw error; // <-- CRÍTICO: Si Supabase da error, fuerza el salto al catch

    // Cartel de Éxito funcional:
    Alert.alert('Éxito', 'Equipo añadido con éxito a la base de datos.', [ // Solo funciona en el celular, en web no se muestra el alert
      { text: 'OK', onPress: () => router.dismissAll() }
    ]);
    
  } catch (error: any) {
    // Cartel de Error funcional:
    Alert.alert('Error al añadir equipo', error.message || 'Verifica que el número de serie no esté duplicado.');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <ScrollView style={styles.container_C_E} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title_C_E}>Registrar Nuevo Equipo</Text>

      <Text style={styles.label_C_E}>Nº de Serie (Escaneado)</Text>
      <TextInput style={styles.input_C_E} value={serial} onChangeText={setSerial} placeholder="Nº de Serie" />

      <Text style={styles.label_C_E}>Modelo / Descripción</Text>
      <TextInput style={styles.input_C_E} value={model} onChangeText={setModel} placeholder="Ej: HP LaserJet M404dn" />

      <Text style={styles.label_C_E}>Estado Inicial</Text>
      <TextInput style={styles.input_C_E} value={status} onChangeText={setStatus} placeholder="Ej: Disponible, En Depósito" />

      <Text style={styles.label_C_E}>Contador de Entrada Inicial</Text>
      <TextInput style={styles.input_C_E} value={inputCounter} onChangeText={setInputCounter} keyboardType="numeric" placeholder="Ej: 0" />

      <Text style={styles.label_C_E}>ID Cliente de Origen (Opcional)</Text>
      <TextInput style={styles.input_C_E} value={originId} onChangeText={setOriginId} keyboardType="numeric" placeholder="Dejar vacío si es stock propio" />

      <TouchableOpacity style={styles.btn_C_E} onPress={handleCreate} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText_C_E}>Dar de Alta Equipo</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
