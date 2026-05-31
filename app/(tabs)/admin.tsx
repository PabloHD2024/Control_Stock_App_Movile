import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AdminScreen() {
  const [serial, setSerial] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('Depósito');
  const [counter, setCounter] = useState('0');

  const handleCreate = async () => {
  if (!serial || !brand || !model || !location) {
    return Alert.alert('Error', 'Completa los campos obligatorios');
  }

  try {
    const { error } = await supabase.from('equipos').insert({serie: serial.trim().toUpperCase(),
      modelo: `${brand} ${model}`, // Consolida marca y modelo
      estado: 'Disponible',
      contador_entrada: parseInt(counter, 10),
      contador_salida: parseInt(counter, 10),
    });

    if (error) throw error;

    Alert.alert('Éxito', 'Equipo añadido con éxito.');
    setSerial(''); setBrand(''); setModel(''); setCounter('0');
  } catch (error: any) {
    Alert.alert('Error', 'No se pudo añadir el equipo: ' + error.message);
  }
};

  return (
    <ScrollView style={{ backgroundColor: '#f8f9fa' }} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.sectionTitle}>Dar de Alta Nuevo Equipo</Text>
      
      <Text style={styles.label}>Número de Serie (Obligatorio)</Text>
      <TextInput style={styles.input} value={serial} onChangeText={setSerial} placeholder="Escribe o copia la serie" />

      <Text style={styles.label}>Marca</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Ej: Ricoh, Brother" />

      <Text style={styles.label}>Modelo</Text>
      <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Ej: Aficio MP 301" />

      <Text style={styles.label}>Ubicación Inicial</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />

      <Text style={styles.label}>Contador Inicial</Text>
      <TextInput style={styles.input} value={counter} onChangeText={setCounter} keyboardType="numeric" />

      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={styles.btnText}>Guardar en Base de Datos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: '#fff', padding: 12, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, marginBottom: 14, color: '#a7a7a7' },
  btn: { backgroundColor: '#28a745', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});