import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function UsuariosScreen() {
  const { role, user } = useAuth();

    console.log("Auditoria de rol - Usuario actual:", user?.email, "Rol detectado en la app:", role)

  const isAdmin = role === 'admin';

  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('user'); // 'user' o 'admin'
  const [loading, setLoading] = useState(false);

  // Bloqueo de seguridad a nivel de interfaz
  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.deniedText}>⚠️ Acceso Denegado</Text>
        <Text style={styles.deniedSub}>Esta sección es exclusiva para Administradores del sistema.</Text>
      </View>
    );
  }

  const handleCreateUserProfile = async () => {
  if (!email.trim()) return Alert.alert('Error', 'El correo electrónico es obligatorio.');
  
  setLoading(true);
  try {
    const { error } = await supabase
      .from('perfiles') 
      .insert([{ 
        email: email.trim().toLowerCase(), 
        rol: userRole 
      }]);

    if (error) throw error;

    // Cartel de éxito
    Alert.alert('Éxito', `Usuario añadido con éxito con el rol: ${userRole}.`);
    setEmail('');
  } catch (err: any) {
    // Cartel de error
    Alert.alert('Error', err.message || 'No se pudo añadir el usuario.');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>
      <Text style={styles.subtitle}>Habilitá nuevos correos electrónicos y asignales un rol de acceso.</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Correo Electrónico del Colaborador</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none"
          placeholder="ejemplo@empresa.com" 
        />

        <Text style={styles.label}>Rol de Sistema</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, userRole === 'user' && styles.activeRole]} 
            onPress={() => setUserRole('user')}
          >
            <Text style={[styles.roleBtnText, userRole === 'user' && styles.activeRoleText]}>Usuario General</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.roleBtn, userRole === 'admin' && styles.activeRole]} 
            onPress={() => setUserRole('admin')}
          >
            <Text style={[styles.roleBtnText, userRole === 'admin' && styles.activeRoleText]}>Administrador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleCreateUserProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Habilitar Usuario</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007bff' },
  subtitle: { fontSize: 13, color: '#6c757d', marginBottom: 20, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  deniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc3545', marginBottom: 8 },
  deniedSub: { fontSize: 14, color: '#6c757d', textAlign: 'center' },
  formCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#e3e6ec' },
  label: { fontSize: 14, fontWeight: '500', color: '#495057', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 12, fontSize: 16, color: '#a7a7a7' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 15 },
  roleBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#ced4da', alignItems: 'center', borderRadius: 6, marginRight: 5, backgroundColor: '#f8f9fa' },
  activeRole: { backgroundColor: '#007bff', borderColor: '#007bff' },
  roleBtnText: { fontSize: 14, color: '#495057', fontWeight: '500' },
  activeRoleText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#007bff', borderRadius: 6, padding: 14, alignItems: 'center', marginTop: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});