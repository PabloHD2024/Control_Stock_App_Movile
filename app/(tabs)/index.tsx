import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../styles/styles';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center_tab_index}>
        <Text style={styles.permisos_tab_index}>Requiere permisos de cámara para escanear.</Text>
        <Button onPress={requestPermission} title="Dar Permiso" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
  // 1. Limpiamos espacios y pasamos a mayúsculas por si las dudas
  const serieEscaneada = data.trim().toUpperCase(); 
  console.log("Serie procesada por la app:", serieEscaneada);

  // 2. Buscamos de forma más flexible (quitamos .single() para evitar crasheos de formato)
  const { data: resultados, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('serie', serieEscaneada);

  if (error) {
    console.error("Error al consultar Supabase:", error.message);
    return Alert.alert("Error de conexión", "No se pudo consultar la base de datos.");
  }

  // 3. Evaluamos si encontramos el equipo en el array de resultados
  if (resultados && resultados.length > 0) {
    const equipoEncontrado = resultados[0];
    console.log("¡Equipo encontrado con éxito!", equipoEncontrado);
    
    // Redirigimos a la pantalla de detalles pasándole el ID interno
    router.push({
      pathname: '/details',
      params: { id: equipoEncontrado.id }
    });
  } else {
    // 4. ¡LA CLAVE! Si no lo encuentra, le damos la opción de agregarlo
    console.log(`La serie ${serieEscaneada} no arrojó resultados.`);
    
    Alert.alert(
      "Equipo no registrado",
      `El número de serie "${serieEscaneada}" no existe en el sistema. ¿Qué deseás hacer?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Registrar Nuevo",
          onPress: () => {
            // Te manda a la pantalla para crear el equipo y le pasa la serie por parámetro
            router.push({
              pathname: '/create-entry', // <-- Reemplazá por el nombre de tu pantalla de formulario
              params: { serie: serieEscaneada }
            });
          }
        }
      ]
    );
  }
};

  return (
    <View style={styles.container_tab_index}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay_tab_index}>
        <Text style={styles.scanText_tab_index}>Apunta al código QR o de barras</Text>
      </View>
    </View>
  );
}