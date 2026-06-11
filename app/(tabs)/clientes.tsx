import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, StyleSheet, RefreshControl, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDB } from '../../lib/database';
import CustomHeader from '../customHeader';
import { Ionicons } from '@expo/vector-icons';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modo, setModo] = useState<'lista' | 'nuevo'>('lista');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [guardando, setGuardando] = useState(false);

  const fetchClientes = async () => {
    try {
      const db = await getDB();
      const data: any[] = await db.getAllAsync(`SELECT * FROM clientes ORDER BY nombre ASC`);
      setClientes(data || []);
    } catch (e: any) {
      console.error('Error cargando clientes:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchClientes();
  }, []));

  const handleGuardar = async () => {
    if (!nombre.trim()) return Alert.alert('Error', 'El nombre es obligatorio.');
    setGuardando(true);
    try {
      const db = await getDB();
      await db.runAsync(
        `INSERT INTO clientes (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?);`,
        [nombre.trim(), direccion.trim(), telefono.trim(), email.trim()]
      );
      Alert.alert('Éxito', 'Cliente agregado correctamente.');
      setNombre(''); setDireccion(''); setTelefono(''); setEmail('');
      setModo('lista');
      fetchClientes();
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo guardar el cliente: ' + e.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (cliente: any) => {
    if (cliente.id === 1) return Alert.alert('No permitido', 'El Depósito Propio no puede eliminarse.');
    Alert.alert('Eliminar', `¿Eliminar a "${cliente.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const db = await getDB();
          await db.runAsync(`DELETE FROM clientes WHERE id = ?`, [cliente.id]);
          setClientes(prev => prev.filter(c => c.id !== cliente.id));
        },
      },
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#007bff" /></View>;

  return (
    <View style={s.container}>
      <CustomHeader title="Clientes" />

      <View style={s.toolbar}>
        <TouchableOpacity style={[s.tabBtn, modo === 'lista' && s.tabActive]} onPress={() => setModo('lista')}>
          <Text style={[s.tabText, modo === 'lista' && s.tabTextActive]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, modo === 'nuevo' && s.tabActive]} onPress={() => setModo('nuevo')}>
          <Ionicons name="add-circle-outline" size={16} color={modo === 'nuevo' ? '#fff' : '#0c2b8f'} />
          <Text style={[s.tabText, modo === 'nuevo' && s.tabTextActive]}>Nuevo Cliente</Text>
        </TouchableOpacity>
      </View>

      {modo === 'nuevo' ? (
        <ScrollView contentContainerStyle={s.form}>
          <Text style={s.label}>Nombre / Razón Social *</Text>
          <TextInput style={s.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Empresa ABC S.A." />

          <Text style={s.label}>Dirección</Text>
          <TextInput style={s.input} value={direccion} onChangeText={setDireccion} placeholder="Ej: Av. Corrientes 1234" />

          <Text style={s.label}>Teléfono</Text>
          <TextInput style={s.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholder="Ej: 011-4444-1234" />

          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Ej: contacto@empresa.com" />

          <TouchableOpacity style={s.saveBtn} onPress={handleGuardar} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Guardar Cliente</Text>}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClientes(); }} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color="#ced4da" />
              <Text style={s.emptyText}>No hay clientes registrados.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardLeft}>
                <View style={[s.idBadge, item.id === 1 && { backgroundColor: '#0c2b8f' }]}>
                  <Text style={s.idText}>ID {item.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.nombre}>{item.nombre}</Text>
                  {item.direccion ? <Text style={s.sub}>{item.direccion}</Text> : null}
                  {item.telefono ? <Text style={s.sub}>📞 {item.telefono}</Text> : null}
                  {item.email ? <Text style={s.sub}>✉️ {item.email}</Text> : null}
                </View>
              </View>
              {item.id !== 1 && (
                <TouchableOpacity onPress={() => handleEliminar(item)} style={s.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#dc3545" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: { flexDirection: 'row', margin: 15, gap: 10 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#0c2b8f', backgroundColor: '#fff' },
  tabActive: { backgroundColor: '#0c2b8f' },
  tabText: { color: '#0c2b8f', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#495057', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 12, fontSize: 15 },
  saveBtn: { backgroundColor: '#0c2b8f', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginHorizontal: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e3e6ec', elevation: 2 },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 12 },
  idBadge: { backgroundColor: '#28a745', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, minWidth: 44, alignItems: 'center' },
  idText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  nombre: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 3 },
  sub: { fontSize: 12, color: '#6c757d', marginTop: 1 },
  deleteBtn: { padding: 6 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#6c757d', fontSize: 15, marginTop: 12 },
});
