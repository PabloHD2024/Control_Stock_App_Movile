import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { styles } from '../styles/styles';

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
      <View style={styles.center_tab_usuarios}>
        <Text style={styles.deniedText_tab_usuarios}>⚠️ Acceso Denegado</Text>
        <Text style={styles.deniedSub_tab_usuarios}>Esta sección es exclusiva para Administradores del sistema.</Text>
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
    <View style={styles.container_tab_usuarios}>
      <Text style={styles.title_tab_usuarios}>Gestión de Usuarios</Text>
      <Text style={styles.subtitle_tab_usuarios}>Habilitá nuevos correos electrónicos y asignales un rol de acceso.</Text>

      <View style={styles.formCard_tab_usuarios}>
        <Text style={styles.label_tab_usuarios}>Correo Electrónico del Colaborador</Text>
        <TextInput 
          style={styles.input_tab_usuarios} 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none"
          placeholder="ejemplo@empresa.com" 
        />

        <Text style={styles.label_tab_usuarios}>Rol de Sistema</Text>
        <View style={styles.roleContainer_tab_usuarios}>
          <TouchableOpacity 
            style={[styles.roleBtn_tab_usuarios, userRole === 'user' && styles.activeRole_tab_usuarios]} 
            onPress={() => setUserRole('user')}
          >
            <Text style={[styles.roleBtnText_tab_usuarios, userRole === 'user' && styles.activeRoleText_tab_usuarios]}>Usuario General</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.roleBtn_tab_usuarios, userRole === 'admin' && styles.activeRole_tab_usuarios]} 
            onPress={() => setUserRole('admin')}
          >
            <Text style={[styles.roleBtnText_tab_usuarios, userRole === 'admin' && styles.activeRoleText_tab_usuarios]}>Administrador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn_tab_usuarios} onPress={handleCreateUserProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText_tab_usuarios}>Habilitar Usuario</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}