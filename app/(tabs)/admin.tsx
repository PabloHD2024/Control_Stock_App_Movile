import React, { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB } from '../../lib/database';
import { styles } from '../styles/styles';
import CustomHeader from '../customHeader';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  const { session } = useAuth();
  const usuarioEmail = session?.user?.email ?? 'desconocido';
  const draftKey = `draft_admin_${usuarioEmail}`;

  const [serial, setSerial] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [counter, setCounter] = useState('0');
  const [loading, setLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const isDataLoaded = useRef(false);

  // 1. Cargar borrador al montar
  useEffect(() => {
    loadDraft();
  }, []);

  // 2. Guardar borrador automáticamente SOLO cuando ya se haya cargado
  useEffect(() => {
    if (!isDataLoaded.current) return;
    saveDraft();
  }, [serial, brand, model, counter]);

  // CAMBIO: Transformadas a funciones tradicionales (Corrige el aviso de ESLint)
  async function loadDraft() {
    try {
      const saved = await AsyncStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.serial || draft.brand || draft.model) {
          setSerial(draft.serial ?? '');
          setBrand(draft.brand ?? '');
          setModel(draft.model ?? '');
          setCounter(draft.counter ?? '0');
          setHasDraft(true);
        }
      }
    } catch (e) {
      console.error('Error cargando borrador admin:', e);
    } finally {
      setTimeout(() => {
        isDataLoaded.current = true;
      }, 100);
    }
  }

  async function saveDraft() {
    try {
      if (!serial.trim() && !brand.trim() && !model.trim() && counter === '0') {
        await AsyncStorage.removeItem(draftKey);
        setHasDraft(false);
        return;
      }
      await AsyncStorage.setItem(draftKey, JSON.stringify({ serial, brand, model, counter }));
      setHasDraft(true);
    } catch (e) {
      console.error('Error guardando borrador admin:', e);
    }
  }

  async function clearDraft() {
    try {
      await AsyncStorage.removeItem(draftKey);
      setHasDraft(false);
    } catch (e) {
      console.error('Error limpiando borrador admin:', e);
    }
  }

  const resetForm = () => {
    isDataLoaded.current = false;
    setSerial('');
    setBrand('');
    setModel('');
    setCounter('0');
    setTimeout(() => { isDataLoaded.current = true; }, 100);
  };

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

      await db.runAsync(
        `INSERT INTO equipos (serie, modelo, estado, contador_entrada, contador_salida, fecha_entrada) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [serieFormateada, modeloConsolidado, 'Disponible', contInicial, contInicial, fechaActual]
      );

      await clearDraft();
      resetForm();

      Alert.alert('Éxito', 'Equipo añadido con éxito a la base de datos local.');
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

      {hasDraft && (
        <View style={s.draftBanner}>
          <Ionicons name="time-outline" size={16} color="#856404" />
          <Text style={s.draftText}>Tenés un formulario incompleto guardado</Text>
        </View>
      )}

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

      {hasDraft && (
        <TouchableOpacity style={s.discardBtn} onPress={() => {
          Alert.alert('Descartar borrador', '¿Seguro que querés limpiar el formulario?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Limpiar', style: 'destructive', onPress: async () => {
              await clearDraft();
              resetForm();
            }},
          ]);
        }}>
          <Ionicons name="trash-outline" size={15} color="#dc3545" />
          <Text style={s.discardText}>Descartar borrador</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  draftBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff3cd', borderWidth: 1, borderColor: '#ffc107',
    borderRadius: 8, padding: 10, marginHorizontal: 16, marginTop: 12,
  },
  draftText: { fontSize: 13, color: '#856404', fontWeight: '600', flex: 1 },
  discardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 8, marginBottom: 24, padding: 10,
  },
  discardText: { fontSize: 13, color: '#dc3545' },
});