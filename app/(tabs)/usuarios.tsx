import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getDB } from '../../lib/database';
import { styles } from '../styles/styles';
import CustomHeader from '../customHeader';
import { Ionicons } from '@expo/vector-icons';

export default function UsuariosScreen() {
  const { session } = useAuth();
  const role = session?.user?.rol;
  const isAdmin = role === 'admin';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return (
      <View style={styles.center_tab_usuarios}>
        <Text style={styles.deniedText_tab_usuarios}>⚠️ Acceso Denegado</Text>
        <Text style={styles.deniedSub_tab_usuarios}>
          Esta sección es exclusiva para Administradores del sistema.
        </Text>
      </View>
    );
  }

  const handleCreateUserProfile = async () => {
    if (!email.trim()) return Alert.alert('Error', 'El correo electrónico es obligatorio.');
    if (!password.trim() || password.length < 4)
      return Alert.alert('Error', 'La contraseña debe tener al menos 4 caracteres.');

    setLoading(true);
    try {
      const db = await getDB();
      const emailLimpio = email.trim().toLowerCase();

      await db.runAsync(
        `INSERT INTO perfiles (email, password, rol) VALUES (?, ?, ?);`,
        [emailLimpio, password.trim(), userRole]
      );

      Alert.alert('Éxito', `Usuario "${emailLimpio}" habilitado con rol: ${userRole}.`);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'Este correo electrónico ya está registrado en el sistema.');
      } else {
        Alert.alert('Error', 'No se pudo añadir el usuario: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container_tab_usuarios}>
      <CustomHeader title="Usuarios" />

      {/* Botón para ver lista de usuarios */}
      <TouchableOpacity
        style={listBtn.container}
        onPress={() => router.push('/lista_usuarios')}
      >
        <Ionicons name="people" size={20} color="#0c2b8f" />
        <Text style={listBtn.text}>Ver usuarios registrados</Text>
        <Ionicons name="chevron-forward" size={18} color="#0c2b8f" />
      </TouchableOpacity>

      <Text style={styles.title_tab_usuarios}>Agregar Nuevo Usuario</Text>
      <Text style={styles.subtitle_tab_usuarios}>
        Habilitá nuevos correos electrónicos y asignales un rol de acceso.
      </Text>

      <View style={styles.formCard_tab_usuarios}>
        <Text style={styles.label_tab_usuarios}>Correo Electrónico</Text>
        <TextInput
          style={styles.input_tab_usuarios}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="ejemplo@empresa.com"
        />

        <Text style={styles.label_tab_usuarios}>Contraseña de Acceso</Text>
        <TextInput
          style={styles.input_tab_usuarios}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Mínimo 4 caracteres"
        />

        <Text style={styles.label_tab_usuarios}>Rol de Sistema</Text>
        <View style={styles.roleContainer_tab_usuarios}>
          <TouchableOpacity
            style={[styles.roleBtn_tab_usuarios, userRole === 'user' && styles.activeRole_tab_usuarios]}
            onPress={() => setUserRole('user')}
          >
            <Text style={[styles.roleBtnText_tab_usuarios, userRole === 'user' && styles.activeRoleText_tab_usuarios]}>
              Usuario General
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn_tab_usuarios, userRole === 'admin' && styles.activeRole_tab_usuarios]}
            onPress={() => setUserRole('admin')}
          >
            <Text style={[styles.roleBtnText_tab_usuarios, userRole === 'admin' && styles.activeRoleText_tab_usuarios]}>
              Administrador
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveBtn_tab_usuarios}
          onPress={handleCreateUserProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText_tab_usuarios}>Habilitar Usuario</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const listBtn = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d0d8f0',
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#0c2b8f',
  },
};
