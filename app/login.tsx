import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Campos incompletos', 'Por favor, ingresa tu correo y contraseña.');
    }
    
    setLoading(true);
    console.log("Intentando conectar con Supabase para el email:", email.trim());
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      console.log("Respuesta de Supabase - Data:", data);
      console.log("Respuesta de Supabase - Error:", error);

      if (error) {
        Alert.alert('Error de autenticación', error.message);
      }
    } catch (err: any) {
      console.log("Error general atrapado en el bloque catch:", err);
      Alert.alert('Error de red', 'No se pudo establecer comunicación con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
      source={require('../assets/Warehouse_Bkg_5.png')}
      style={styles.containerBackground}
      resizeMode="cover" // Opciones: 'cover', 'contain', 'stretch', 'repeat', 'center'
      imageStyle={{ opacity: 0.5 }} // Ajusta la opacidad de la imagen de fondo
    >
      <Text style={styles.logo}>Control de Activos</Text>

      {/* Campo de Correo Electrónico */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      {/* Campo de Contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      {/* Botón de Ingreso con indicador de carga incorporado */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f8f9fa' },
  logo: { fontSize: 35, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#0c2b8f' },
  inputContainer: { marginBottom: 16, paddingHorizontal: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#0c2b8f', padding: 5},
  input: { backgroundColor: '#fff', padding: 12, fontSize: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ced4da', color: '#a7a7a7' },
  button: { backgroundColor: '#007bff', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10, marginHorizontal: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  containerBackground: { flex: 1, justifyContent: 'center', width: '100%', height: '100%' },
});