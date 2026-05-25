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

    const { error } = await supabase.from('equipments').insert({
      serial_number: serial,
      brand,
      model,
      current_location: location,
      initial_counter: parseInt(counter, 10),
      current_counter: parseInt(counter, 10),
    });

    if (error) {
      Alert.alert('Error', 'No se pudo crear el activo (puede que la serie ya exista).');
    } else {
      Alert.alert('Éxito', 'Equipo registrado.');
      setSerial(''); setBrand(''); setModel(''); setCounter('0');
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
  input: { backgroundColor: '#fff', padding: 12, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, marginBottom: 14 },
  btn: { backgroundColor: '#28a745', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});