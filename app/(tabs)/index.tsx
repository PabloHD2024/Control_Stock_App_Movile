import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { getDB } from '../../lib/database';
import CustomHeader from '../customHeader';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={localStyles.center_permisos}>
        <CustomHeader title="Escáner QR" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16 }}>
            Se requieren permisos de cámara para escanear los activos.
          </Text>
          <Button onPress={requestPermission} title="Dar Permiso a la Cámara" />
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    const serieEscaneada = data.trim().toUpperCase();
    console.log("Serie procesada por la app:", serieEscaneada);

    try {
      const db = await getDB();
      const resultados: any[] = await db.getAllAsync(
        'SELECT * FROM equipos WHERE serie = ?',
        [serieEscaneada]
      );

      if (resultados && resultados.length > 0) {
        const equipoEncontrado = resultados[0];
        // Equipo encontrado: ir a detalles
        router.push({
          pathname: '/details',
          params: { id: equipoEncontrado.id },
        });
        setScanned(false);
      } else {
        // Equipo no registrado: preguntar si registrar
        Alert.alert(
          "Equipo no registrado",
          `La serie "${serieEscaneada}" no existe localmente. ¿Deseás registrarla?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => setScanned(false),
            },
            {
              text: "Registrar Nuevo",
              onPress: () => {
                setScanned(false);
                router.push({
                  pathname: '/create_equipment',
                  params: { serie: serieEscaneada },
                });
              },
            },
          ]
        );
      }
    } catch (err: any) {
      console.error("Error en SQLite:", err);
      Alert.alert("Error", "No se pudo consultar la base de datos local.");
      setScanned(false);
    }
  };

  return (
    <View style={localStyles.mainContainer}>
      <CustomHeader title="Escáner QR" />
      <View style={localStyles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={localStyles.overlay}>
          <Text style={localStyles.scanText}>Apunta al código QR o de barras</Text>
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  center_permisos: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
