import React, { useEffect, useState, useRef } from 'react';
import {
  Text, TextInput, View, TouchableOpacity, Alert,
  ScrollView, ActivityIndicator, StyleSheet, Modal, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB } from '../lib/database';
import { useAuth } from '../context/AuthContext';
import styles from './styles/styles';
import { Ionicons } from '@expo/vector-icons';

export default function DetailsScreen() {
  const { id, serie } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const isAdmin = session?.user?.rol === 'admin';
  const usuarioEmail = session?.user?.email ?? 'desconocido';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<'origen' | 'destino'>('destino');
  const [hasDraft, setHasDraft] = useState(false);

  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('');
  const [origenCliente, setOrigenCliente] = useState<any>(null);
  const [destinoCliente, setDestinoCliente] = useState<any>(null);
  const [inputCounter, setInputCounter] = useState('');
  const [outputCounter, setOutputCounter] = useState('');
  const [originalEquipment, setOriginalEquipment] = useState<any>(null);

  // Clave única por usuario + equipo
  const draftKey = `draft_details_${usuarioEmail}_${id ?? serie}`;

  // Evitar guardar borrador antes de que los datos originales se carguen
  const isDataLoaded = useRef(false);

  useEffect(() => { fetchData(); }, [id, serie]);

  // Guardar borrador automáticamente cada vez que cambia un campo
  useEffect(() => {
    if (!isDataLoaded.current) return;
    saveDraft();
  }, [serialNumber, model, status, origenCliente, destinoCliente, inputCounter, outputCounter]);

  const saveDraft = async () => {
    try {
      const draft = { serialNumber, model, status, origenCliente, destinoCliente, inputCounter, outputCounter };
      await AsyncStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      console.error('Error guardando borrador:', e);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(draftKey);
      setHasDraft(false);
    } catch (e) {
      console.error('Error limpiando borrador:', e);
    }
  };

  const loadOriginalData = (data: any, clientesData: any[]) => {
    setSerialNumber(data.serie || '');
    setModel(data.modelo || '');
    setStatus(data.estado || '');
    setInputCounter(data.contador_entrada?.toString() || '0');
    setOutputCounter(data.contador_salida?.toString() || '0');

    if (data.lugar_origen_id) {
      const origen = clientesData.find(c => c.id === data.lugar_origen_id);
      setOrigenCliente(origen || null);
    }
    if (data.lugar_destino_id) {
      const destino = clientesData.find(c => c.id === data.lugar_destino_id);
      setDestinoCliente(destino || null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const db = await getDB();

      const clientesData: any[] = await db.getAllAsync(`SELECT * FROM clientes ORDER BY nombre ASC`);
      setClientes(clientesData);

      let data: any = null;
      if (id) {
        data = await db.getFirstAsync('SELECT * FROM equipos WHERE id = ?', [parseInt(id as string, 10)]);
      } else if (serie) {
        data = await db.getFirstAsync('SELECT * FROM equipos WHERE serie = ?', [(serie as string).trim().toUpperCase()]);
      }

      if (!data) {
        Alert.alert('Error', 'No se encontró el equipo.');
        router.back();
        return;
      }

      setOriginalEquipment(data);

      const savedDraft = await AsyncStorage.getItem(draftKey);

      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setHasDraft(true);

        Alert.alert(
          'Borrador encontrado',
          'Tenés un formulario incompleto de este equipo. ¿Querés continuar donde lo dejaste?',
          [
            {
              text: 'Descartar',
              style: 'destructive',
              onPress: async () => {
                await clearDraft();
                loadOriginalData(data, clientesData);
                isDataLoaded.current = true;
              },
            },
            {
              text: 'Continuar',
              onPress: () => {
                setSerialNumber(draft.serialNumber ?? data.serie ?? '');
                setModel(draft.model ?? data.modelo ?? '');
                setStatus(draft.status ?? data.estado ?? '');
                setInputCounter(draft.inputCounter ?? data.contador_entrada?.toString() ?? '0');
                setOutputCounter(draft.outputCounter ?? data.contador_salida?.toString() ?? '0');
                setOrigenCliente(draft.origenCliente ?? null);
                setDestinoCliente(draft.destinoCliente ?? null);
                isDataLoaded.current = true;
              },
            },
          ]
        );
      } else {
        loadOriginalData(data, clientesData);
        isDataLoaded.current = true;
      }
    } catch (err) {
      console.error("Error en fetchData:", err);
      Alert.alert('Error', 'Fallo al leer la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const abrirPicker = (tipo: 'origen' | 'destino') => {
    setModalTipo(tipo);
    setModalVisible(true);
  };

  const seleccionarCliente = (cliente: any) => {
    if (modalTipo === 'origen') setOrigenCliente(cliente);
    else setDestinoCliente(cliente);
    setModalVisible(false);
  };

  const handleUpdate = async () => {
    if (!destinoCliente) return Alert.alert('Error', 'Seleccioná un cliente de destino.');
    if (!outputCounter.trim()) return Alert.alert('Error', 'El contador de salida es obligatorio.');

    setSubmitting(true);
    try {
      const db = await getDB();
      const fechaActual = new Date().toISOString();
      const contSalida = parseInt(outputCounter, 10);

      if (isAdmin) {
        await db.runAsync(
          `UPDATE equipos SET serie=?, modelo=?, estado=?, lugar_origen_id=?, lugar_destino_id=?, contador_entrada=?, contador_salida=? WHERE id=?`,
          [serialNumber.trim().toUpperCase(), model.trim(), status.trim(), origenCliente?.id || null, destinoCliente.id, parseInt(inputCounter, 10), contSalida, originalEquipment.id]
        );
      } else {
        await db.runAsync(
          `UPDATE equipos SET lugar_destino_id=?, contador_salida=? WHERE id=?`,
          [destinoCliente.id, contSalida, originalEquipment.id]
        );
      }

      const prevNombre = originalEquipment.lugar_destino_id
        ? (clientes.find(c => c.id === originalEquipment.lugar_destino_id)?.nombre || `ID: ${originalEquipment.lugar_destino_id}`)
        : 'Depósito Propio';

      await db.runAsync(
        `INSERT INTO equipment_logs (equipment_id, usuario_email, previous_location, new_location, previous_counter, new_counter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [originalEquipment.id, usuarioEmail, prevNombre, destinoCliente.nombre, originalEquipment.contador_salida || 0, contSalida, fechaActual]
      );

      // Limpiar borrador al guardar exitosamente
      await clearDraft();
      isDataLoaded.current = false;

      Alert.alert('Éxito', 'Movimiento guardado correctamente.', [
        { text: 'Ver movimientos', onPress: () => router.push('/(tabs)/movimientos') },
        { text: 'Volver al inicio', onPress: () => router.push('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo guardar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center_D_S}><ActivityIndicator size="large" color="#007bff" /></View>;

  return (
    <ScrollView style={styles.container_D_S} contentContainerStyle={{ padding: 20 }}>

      {hasDraft && (
        <View style={ls.draftBanner}>
          <Ionicons name="time-outline" size={16} color="#856404" />
          <Text style={ls.draftText}>Estás editando un borrador guardado</Text>
        </View>
      )}

      <Text style={styles.roleNotice_D_S}>Modo: {isAdmin ? 'Administrador' : 'Usuario General'}</Text>

      <Text style={styles.label_D_S}>Nº de Serie</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={serialNumber} onChangeText={setSerialNumber} editable={isAdmin} />

      <Text style={styles.label_D_S}>Modelo</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={model} onChangeText={setModel} editable={isAdmin} />

      <Text style={styles.label_D_S}>Estado</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={status} onChangeText={setStatus} editable={isAdmin} />

      <Text style={styles.label_D_S}>Contador de Entrada</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={inputCounter} onChangeText={setInputCounter} editable={isAdmin} keyboardType="numeric" />

      {isAdmin && (
        <>
          <Text style={styles.label_D_S}>Cliente de Origen</Text>
          <TouchableOpacity style={ls.picker} onPress={() => abrirPicker('origen')}>
            <Text style={ls.pickerText}>{origenCliente ? `${origenCliente.nombre} (ID: ${origenCliente.id})` : 'Seleccionar cliente origen...'}</Text>
            <Ionicons name="chevron-down" size={18} color="#6c757d" />
          </TouchableOpacity>
        </>
      )}

      <View style={styles.separator_D_S} />

      <Text style={styles.label_D_S}>Cliente de Destino *</Text>
      <TouchableOpacity style={ls.picker} onPress={() => abrirPicker('destino')}>
        <Text style={ls.pickerText}>{destinoCliente ? `${destinoCliente.nombre} (ID: ${destinoCliente.id})` : 'Seleccionar cliente destino...'}</Text>
        <Ionicons name="chevron-down" size={18} color="#6c757d" />
      </TouchableOpacity>

      <Text style={styles.label_D_S}>Contador de Salida *</Text>
      <TextInput style={styles.input_D_S} value={outputCounter} onChangeText={setOutputCounter} keyboardType="numeric" placeholder="Contador actual" />

      <TouchableOpacity style={styles.saveBtn_D_S} onPress={handleUpdate} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText_D_S}>Guardar Movimiento</Text>}
      </TouchableOpacity>

      {hasDraft && (
        <TouchableOpacity style={ls.discardBtn} onPress={() => {
          Alert.alert('Descartar borrador', '¿Seguro que querés descartar los cambios sin guardar?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Descartar', style: 'destructive', onPress: async () => {
              await clearDraft();
              isDataLoaded.current = false;
              fetchData();
            }},
          ]);
        }}>
          <Ionicons name="trash-outline" size={15} color="#dc3545" />
          <Text style={ls.discardText}>Descartar borrador</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={ls.modalOverlay}>
          <View style={ls.modalBox}>
            <View style={ls.modalHeader}>
              <Text style={ls.modalTitle}>
                {modalTipo === 'origen' ? 'Seleccionar Origen' : 'Seleccionar Destino'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={clientes}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={ls.clienteRow} onPress={() => seleccionarCliente(item)}>
                  <View style={ls.clienteIdBadge}>
                    <Text style={ls.clienteIdText}>ID {item.id}</Text>
                  </View>
                  <View>
                    <Text style={ls.clienteNombre}>{item.nombre}</Text>
                    {item.direccion ? <Text style={ls.clienteSub}>{item.direccion}</Text> : null}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const ls = StyleSheet.create({
  draftBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff3cd', borderWidth: 1, borderColor: '#ffc107',
    borderRadius: 8, padding: 10, marginBottom: 14,
  },
  draftText: { fontSize: 13, color: '#856404', fontWeight: '600' },
  discardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 12, padding: 10,
  },
  discardText: { fontSize: 13, color: '#dc3545' },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da',
    borderRadius: 6, padding: 12, marginBottom: 4,
  },
  pickerText: { fontSize: 15, color: '#333', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e3e6ec' },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#0c2b8f' },
  clienteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  clienteIdBadge: { backgroundColor: '#0c2b8f', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, minWidth: 44, alignItems: 'center' },
  clienteIdText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  clienteNombre: { fontSize: 15, fontWeight: '600', color: '#333' },
  clienteSub: { fontSize: 12, color: '#6c757d' },
});
