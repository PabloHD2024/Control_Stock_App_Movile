import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { styles } from './styles/styles';
import { useAuth } from '../context/AuthContext';
import { getDB } from '../lib/database';

//Chequeamos que la BD se inicialice correctamente y que el admin por defecto esté presente
useEffect(() => {
  const checkDB = async () => {
    const db = await getDB();
    const users = await db.getAllAsync('SELECT * FROM perfiles');
    console.log('Usuarios en BD:', users);
  };
  checkDB();
}, []);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLocal } = useAuth(); // <-- Consumimos el nuevo login local

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Por favor, completa todos los campos.');
    }

    setLoading(true);
    
    // Llamamos al login offline
    const { error } = await loginLocal(email, password);

    setLoading(false);

    if (error) {
      Alert.alert('Error de Inicio de Sesión', error);
    }
    // Nota: Si el login es exitoso, el useEffect de tu _layout.tsx 
    // se activará solo y redirigirá al usuario a las pestañas.
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