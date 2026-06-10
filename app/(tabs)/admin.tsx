import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getDB } from '../../lib/database'; // <-- Importamos SQLite local
import styles from '../styles/styles';
import CustomHeader from '../customHeader'; // <-- Importamos el header personalizado

export default function AdminScreen() {
  const [serial, setSerial] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('Depósito');
  const [counter, setCounter] = useState('0');
  const [loading, setLoading] = useState(false); // Para controlar el estado del botón

  const handleCreate = async () => {
  if (!serial.trim() || !brand.trim() || !model.trim() || !location.trim()) {
    return Alert.alert('Error', 'Completa los campos obligatorios');
  }

  setLoading(true);

  try {
    const db = await getDB();

    const serieFormateada = serial.trim().toUpperCase();
    const modeloConsolidado = `${brand.trim()} ${model.trim()}`;
    const contInicial = parseInt(counter, 10) || 0;
    const fechaActual = new Date().toISOString();

    // Guardado robusto en SQLite: Nos aseguramos de pasar exactamente 
    // las columnas que creamos en tu inicialización de base de datos
    await db.runAsync(
      `INSERT INTO equipos (serie, modelo, estado, contador_entrada, contador_salida, fecha_entrada) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        serieFormateada, 
        modeloConsolidado, 
        'Disponible', 
        contInicial, 
        contInicial, 
        fechaActual
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
      Alert.alert('Error', 'No se pudo añadir el equipo en el almacenamiento local: ' + error.message);
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
      <TextInput style={styles.input_tab_admin} value={serial} onChangeText={setSerial} placeholder="Escribe o copia la serie" />

      <Text style={styles.label_tab_admin}>Marca</Text>
      <TextInput style={styles.input_tab_admin} value={brand} onChangeText={brand => setBrand(brand)} placeholder="Ej: Ricoh, Brother" />

      <Text style={styles.label_tab_admin}>Modelo</Text>
      <TextInput style={styles.input_tab_admin} value={model} onChangeText={setModel} placeholder="Ej: Aficio MP 301" />

      <Text style={styles.label_tab_admin}>Ubicación Inicial</Text>
      <TextInput style={styles.input_tab_admin} value={location} onChangeText={setLocation} />

      <Text style={styles.label_tab_admin}>Contador Inicial</Text>
      <TextInput style={styles.input_tab_admin} value={counter} onChangeText={setCounter} keyboardType="numeric" />

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
