import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getDB } from '../../lib/database';
import styles from '../styles/styles';
import CustomHeader from '../customHeader';

export default function AdminScreen() {
  const [serial, setSerial] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [counter, setCounter] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!serial.trim() || !brand.trim() || !model.trim()) {
      return Alert.alert('Error', 'Completa los campos obligatorios: Serie, Marca y Modelo.');
    }

    setLoading(true);

    try {
      const db = await getDB();

      const serieFormateada = serial.trim().toUpperCase();
      const modeloConsolidado = `${brand.trim()} ${model.trim()}`;
      const contInicial = parseInt(counter, 10) || 0;
      const fechaActual = new Date().toISOString();

      // ✅ FIX: Se eliminó el campo 'location' de texto libre que no matcheaba
      // con el esquema (lugar_origen_id es INTEGER). El equipo nuevo parte
      // sin origen/destino asignado (null) — se asignan en details.tsx.
      await db.runAsync(
        `INSERT INTO equipos (serie, modelo, estado, contador_entrada, contador_salida, fecha_entrada) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          serieFormateada,
          modeloConsolidado,
          'Disponible',
          contInicial,
          contInicial,
          fechaActual,
        ]
      );

      Alert.alert('Éxito', 'Equipo añadido con éxito a la base de datos local.');
      setSerial('');
      setBrand('');
      setModel('');
      setCounter('0');
    } catch (error: any) {
      console.error("Error al guardar en SQLite:", error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'El número de serie ya se encuentra registrado localmente.');
      } else {
        Alert.alert('Error', 'No se pudo añadir el equipo: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.background_tab_admin}>
      <CustomHeader title="Administración" />
      <Text style={styles.sectionTitle_tab_admin}>Dar de Alta Nuevo Equipo</Text>

      <Text style={styles.label_tab_admin}>Número de Serie (Obligatorio)</Text>
      <TextInput
        style={styles.input_tab_admin}
        value={serial}
        onChangeText={setSerial}
        placeholder="Escribe o copia la serie"
        autoCapitalize="characters"
      />

      <Text style={styles.label_tab_admin}>Marca (Obligatorio)</Text>
      <TextInput
        style={styles.input_tab_admin}
        value={brand}
        onChangeText={setBrand}
        placeholder="Ej: Ricoh, Brother"
      />

      <Text style={styles.label_tab_admin}>Modelo (Obligatorio)</Text>
      <TextInput
        style={styles.input_tab_admin}
        value={model}
        onChangeText={setModel}
        placeholder="Ej: Aficio MP 301"
      />

      <Text style={styles.label_tab_admin}>Contador Inicial</Text>
      <TextInput
        style={styles.input_tab_admin}
        value={counter}
        onChangeText={setCounter}
        keyboardType="numeric"
        placeholder="0"
      />

      <TouchableOpacity
        style={[styles.btn_tab_admin, loading && { opacity: 0.6 }]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.btnText_tab_admin}>
          {loading ? 'Guardando...' : 'Guardar en Base de Datos Local'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
