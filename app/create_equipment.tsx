import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Registrar Nuevo Equipo</Text>

      <Text style={styles.label}>Nº de Serie (Escaneado)</Text>
      <TextInput style={styles.input} value={serial} onChangeText={setSerial} placeholder="Nº de Serie" />

      <Text style={styles.label}>Modelo / Descripción</Text>
      <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Ej: HP LaserJet M404dn" />

      <Text style={styles.label}>Estado Inicial</Text>
      <TextInput style={styles.input} value={status} onChangeText={setStatus} placeholder="Ej: Disponible, En Depósito" />

      <Text style={styles.label}>Contador de Entrada Inicial</Text>
      <TextInput style={styles.input} value={inputCounter} onChangeText={setInputCounter} keyboardType="numeric" placeholder="Ej: 0" />

      <Text style={styles.label}>ID Cliente de Origen (Opcional)</Text>
      <TextInput style={styles.input} value={originId} onChangeText={setOriginId} keyboardType="numeric" placeholder="Dejar vacío si es stock propio" />

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Dar de Alta Equipo</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, fontWeight: '500', color: '#495057', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 12, fontSize: 16 },
  btn: { backgroundColor: '#28a745', borderRadius: 6, padding: 14, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});