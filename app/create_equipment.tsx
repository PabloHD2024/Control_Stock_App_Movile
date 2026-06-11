import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDB } from '../lib/database';
import styles from './styles/styles';

export default function CreateEquipmentScreen() {
  const { serie } = useLocalSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [serial, setSerial] = useState((serie as string) || '');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('Disponible');
  const [inputCounter, setInputCounter] = useState('0');
  const [originId, setOriginId] = useState('');

  const handleCreate = async () => {
    if (!serial.trim() || !model.trim()) {
      return Alert.alert('Error', 'Nº de Serie y Modelo son obligatorios.');
    }

    setSubmitting(true);

    try {
      const db = await getDB();

      const serieFormateada = serial.trim().toUpperCase();
      const modeloFormateado = model.trim();
      const estadoFormateado = status.trim() || 'Disponible';
      const contEntrada = parseInt(inputCounter, 10) || 0;
      // ✅ FIX: el contador de salida inicial es 0, no una copia del de entrada
      const contSalida = 0;
      const origenId = originId.trim() ? parseInt(originId, 10) : null;
      const fecha = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO equipos (serie, modelo, estado, contador_entrada, contador_salida, lugar_origen_id, fecha_entrada) 
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [serieFormateada, modeloFormateado, estadoFormateado, contEntrada, contSalida, origenId, fecha]
      );

      Alert.alert('Éxito', 'Equipo registrado correctamente.', [
        { text: 'OK', onPress: () => router.dismissAll() }
      ]);

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'El número de serie ya se encuentra registrado.');
      } else {
        Alert.alert('Error al añadir equipo', 'No se pudo guardar en la base de datos local: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container_C_E} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title_C_E}>Registrar Nuevo Equipo</Text>

      <Text style={styles.label_C_E}>Nº de Serie (Escaneado)</Text>
      <TextInput
        style={styles.input_C_E}
        value={serial}
        onChangeText={setSerial}
        placeholder="Nº de Serie"
        autoCapitalize="characters"
      />

      <Text style={styles.label_C_E}>Modelo / Descripción</Text>
      <TextInput
        style={styles.input_C_E}
        value={model}
        onChangeText={setModel}
        placeholder="Ej: HP LaserJet M404dn"
      />

      <Text style={styles.label_C_E}>Estado Inicial</Text>
      <TextInput
        style={styles.input_C_E}
        value={status}
        onChangeText={setStatus}
        placeholder="Ej: Disponible, En Depósito"
      />

      <Text style={styles.label_C_E}>Contador de Entrada Inicial</Text>
      <TextInput
        style={styles.input_C_E}
        value={inputCounter}
        onChangeText={setInputCounter}
        keyboardType="numeric"
        placeholder="0"
      />

      <Text style={styles.label_C_E}>ID Cliente de Origen (Opcional)</Text>
      <TextInput
        style={styles.input_C_E}
        value={originId}
        onChangeText={setOriginId}
        keyboardType="numeric"
        placeholder="Dejar vacío si es stock propio"
      />

      <TouchableOpacity style={styles.btn_C_E} onPress={handleCreate} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText_C_E}>Dar de Alta Equipo</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
