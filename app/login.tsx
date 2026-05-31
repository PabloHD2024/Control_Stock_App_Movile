import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { supabase } from '../lib/supabase';
import { styles } from './styles/styles';

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
    }const styles = StyleSheet.create({

});
  };

  return (
    <View style={styles.container_login}>
      <ImageBackground
      source={require('../assets/Warehouse_Bkg_5.png')}
      style={styles.containerBackground_login}
      resizeMode="cover" // Opciones: 'cover', 'contain', 'stretch', 'repeat', 'center'
      imageStyle={{ opacity: 0.5 }} // Ajusta la opacidad de la imagen de fondo
    >
      <Text style={styles.logo}>Control de Activos</Text>

      {/* Campo de Correo Electrónico */}
      <View style={styles.inputContainer_login}>
        <Text style={styles.label_login}>Correo Electrónico</Text>
        <TextInput
          style={styles.input_login}
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      {/* Campo de Contraseña */}
      <View style={styles.inputContainer_login}>
        <Text style={styles.label_login}>Contraseña</Text>
        <TextInput
          style={styles.input_login}
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
        style={styles.button_login} 
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText_login}>Ingresar</Text>
        )}
      </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}