import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDB } from '../lib/database'; // <-- SQLite local
import { useAuth } from '../context/AuthContext';
import styles from './styles/styles';

export default function DetailsScreen() {
  const { id, serie } = useLocalSearchParams();
  const router = useRouter();
  
  // 1. Manejo del rol adaptado al nuevo AuthContext local
  const { session } = useAuth();
  const user = session?.user;
  const isAdmin = session?.user?.rol === 'admin';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados locales para los inputs
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState(''); 
  const [originLocationId, setOriginLocationId] = useState(''); 
  const [destinationLocationId, setDestinationLocationId] = useState(''); 
  const [inputCounter, setInputCounter] = useState(''); 
  const [outputCounter, setOutputCounter] = useState(''); 
  const [originalEquipment, setOriginalEquipment] = useState<any>(null);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id, serie]);

  // 2. Traer detalles desde SQLite local
  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const db = await getDB();
      let data: any = null;

      if (id) {
        data = await db.getFirstAsync('SELECT * FROM equipos WHERE id = ?', [parseInt(id as string, 10)]);
      } else if (serie) {
        data = await db.getFirstAsync('SELECT * FROM equipos WHERE serie = ?', [(serie as string).trim().toUpperCase()]);
      } else {
        return;
      }

      if (!data) {
        Alert.alert('Error', 'No se pudieron recuperar los datos del activo en el almacenamiento local.');
        router.back();
        return;
      }

      // Seteamos los inputs con los registros locales
      setOriginalEquipment(data);
      setSerialNumber(data.serie || '');
      setModel(data.modelo || '');
      setStatus(data.estado || '');
      setOriginLocationId(data.lugar_origen_id ? data.lugar_origen_id.toString() : '');
      
      // Manejo de destino y salida (si ya contaban con registros previos en la base)
      setDestinationLocationId(data.lugar_destino_id ? data.lugar_destino_id.toString() : '');
      setInputCounter(data.contador_entrada ? data.contador_entrada.toString() : '0');
      setOutputCounter(data.contador_salida ? data.contador_salida.toString() : '0');
      
    } catch (err) {
      console.error("Error en fetchEquipmentDetails local:", err);
      Alert.alert('Error', 'Hubo un fallo al leer la base de datos interna.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Ejecutar actualización y Logs en SQLite
  const handleUpdate = async () => {
    if (!destinationLocationId.trim() || !outputCounter.trim()) {
      return Alert.alert('Error', 'El ID de cliente destino y el contador de salida son obligatorios.');
    }

    setSubmitting(true);

    try {
      const db = await getDB();
      const fechaActual = new Date().toISOString();
      const contSalidaNumerico = parseInt(outputCounter, 10);
      const destinoNumerico = parseInt(destinationLocationId, 10);

      if (isAdmin) {
        // El administrador puede editar campos críticos además de la logística básica
        const contEntradaNumerico = parseInt(inputCounter, 10);
        const origenNumerico = originLocationId.trim() ? parseInt(originLocationId, 10) : null;

        await db.runAsync(
          `UPDATE equipos 
           SET serie = ?, modelo = ?, estado = ?, lugar_origen_id = ?, lugar_destino_id = ?, contador_entrada = ?, contador_salida = ?
           WHERE id = ?`,
          [serialNumber.trim().toUpperCase(), model.trim(), status.trim(), origenNumerico, destinoNumerico, contEntradaNumerico, contSalidaNumerico, originalEquipment.id]
        );
      } else {
        // Un usuario común solo actualiza destino y contador final
        await db.runAsync(
          `UPDATE equipos 
           SET lugar_destino_id = ?, contador_salida = ?
           WHERE id = ?`,
          [destinoNumerico, contSalidaNumerico, originalEquipment.id]
        );
      }

      // 4. Inserción automática del log histórico en SQLite local
      try {
        await db.runAsync(
          `INSERT INTO equipment_logs (equipment_id, previous_location, new_location, previous_counter, new_counter, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            originalEquipment.id,
            originalEquipment.lugar_destino_id ? originalEquipment.lugar_destino_id.toString() : 'Depósito',
            destinationLocationId.trim(),
            originalEquipment.contador_salida || 0,
            contSalidaNumerico,
            fechaActual
          ]
        );
      } catch (logError) {
        console.error("Error al escribir el historial local:", logError);
      }

      Alert.alert('Éxito', 'Cambios guardados con trazabilidad informática local.', [
        { 
          text: 'Ver movimientos', 
          onPress: () => router.push('movimientos')
        },
        {
          text: 'Volver al inicio',
          onPress: () => router.push('/(tabs)')
        }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error al actualizar', 'No se pudo guardar la modificación local: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center_D_S}><ActivityIndicator size="large" color="#007bff" /></View>;
  }

  return (
    <ScrollView style={styles.container_D_S} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.roleNotice_D_S}>Modo de acceso: {isAdmin ? 'Administrador' : 'Usuario General'}</Text>
      
      <Text style={styles.label_D_S}>Nº de Serie</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={serialNumber} onChangeText={setSerialNumber} editable={isAdmin} />

      <Text style={styles.label_D_S}>Modelo</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={model} onChangeText={setModel} editable={isAdmin} />

      <Text style={styles.label_D_S}>Estado del Equipo</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={status} onChangeText={setStatus} editable={isAdmin} placeholder="Ej: Activo, En reparación" />

      <Text style={styles.label_D_S}>Contador de Entrada (Inicial)</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={inputCounter} onChangeText={setInputCounter} editable={isAdmin} keyboardType="numeric" />

      <Text style={styles.label_D_S}>ID Cliente de Origen</Text>
      <TextInput style={[styles.input_D_S, !isAdmin && styles.disabled_D_S]} value={originLocationId} onChangeText={setOriginLocationId} editable={isAdmin} keyboardType="numeric" placeholder="ID Cliente Origen" />

      <View style={styles.separator_D_S} />

      {/* Secciones editables por todos (Logística de campo) */}
      <Text style={styles.label_D_S}>ID Cliente de Destino (Relacionar con Cliente)</Text>
      <TextInput style={styles.input_D_S} value={destinationLocationId} onChangeText={setDestinationLocationId} keyboardType="numeric" placeholder="Ingresá el ID numérico del cliente" />

      <Text style={styles.label_D_S}>Contador de Salida / Cierre Actual</Text>
      <TextInput style={styles.input_D_S} value={outputCounter} onChangeText={setOutputCounter} keyboardType="numeric" placeholder="Contador actual de la impresora" />

      <TouchableOpacity style={styles.saveBtn_D_S} onPress={handleUpdate} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText_D_S}>Guardar Movimiento</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}