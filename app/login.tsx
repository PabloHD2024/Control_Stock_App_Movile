import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { styles } from './styles/styles';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLocal } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Por favor, completa todos los campos.');
    }
    setLoading(true);
    const { error } = await loginLocal(email, password);
    setLoading(false);
    if (error) {
      Alert.alert('Error de Inicio de Sesión', error);
    }
  };

  return (
    <View style={styles.container_login}>
      <ImageBackground
        source={require('../assets/Warehouse_Bkg_5.png')}
        style={styles.containerBackground_login}
        resizeMode="cover"
        imageStyle={{ opacity: 0.5 }}
      >
        <Text style={styles.logo}>Control de Activos</Text>

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
