import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import styles from '../styles/styles';

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
    <ScrollView style={ styles.background_tab_admin}>
      <Text style={styles.sectionTitle_tab_admin}>Dar de Alta Nuevo Equipo</Text>
      
      <Text style={styles.label_tab_admin}>Número de Serie (Obligatorio)</Text>
      <TextInput style={styles.input_tab_admin} value={serial} onChangeText={setSerial} placeholder="Escribe o copia la serie" />

      <Text style={styles.label_tab_admin}>Marca</Text>
      <TextInput style={styles.input_tab_admin} value={brand} onChangeText={setBrand} placeholder="Ej: Ricoh, Brother" />

      <Text style={styles.label_tab_admin}>Modelo</Text>
      <TextInput style={styles.input_tab_admin} value={model} onChangeText={setModel} placeholder="Ej: Aficio MP 301" />

      <Text style={styles.label_tab_admin}>Ubicación Inicial</Text>
      <TextInput style={styles.input_tab_admin} value={location} onChangeText={setLocation} />

      <Text style={styles.label_tab_admin}>Contador Inicial</Text>
      <TextInput style={styles.input_tab_admin} value={counter} onChangeText={setCounter} keyboardType="numeric" />

      <TouchableOpacity style={styles.btn_tab_admin} onPress={handleCreate}>
        <Text style={styles.btnText_tab_admin}>Guardar en Base de Datos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}