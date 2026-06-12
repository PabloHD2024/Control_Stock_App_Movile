import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { getDB } from '../../lib/database';
import CustomHeader from '../customHeader';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const askPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    askPermission();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={s.center}>
        <Text>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={s.center}>
        <CustomHeader title="Escáner QR" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16 }}>
            Se requieren permisos de cámara para escanear los activos.
          </Text>
          <Button
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
            title="Dar Permiso a la Cámara"
          />
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    const serieEscaneada = data.trim().toUpperCase();

    try {
      const db = await getDB();
      const resultados: any[] = await db.getAllAsync(
        'SELECT * FROM equipos WHERE serie = ?',
        [serieEscaneada]
      );

      if (resultados && resultados.length > 0) {
        router.push({ pathname: '/details', params: { id: resultados[0].id } });
        setScanned(false);
      } else {
        Alert.alert(
          "Equipo no registrado",
          `La serie "${serieEscaneada}" no existe. ¿Deseás registrarla?`,
          [
            { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
            {
              text: "Registrar Nuevo",
              onPress: () => {
                setScanned(false);
                router.push({ pathname: '/create_equipment', params: { serie: serieEscaneada } });
              },
            },
          ]
        );
      }
    } catch (err: any) {
      console.error("Error en SQLite:", err);
      Alert.alert("Error", "No se pudo consultar la base de datos.");
      setScanned(false);
    }
  };

  return (
    <View style={s.container}>
      <CustomHeader title="Escáner QR" />
      {/* ✅ Dimensiones explícitas para Android */}
      <View style={{ width, flex: 1 }}>
        <CameraView
          style={{ width, height: height * 0.75 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
        />
        <View style={s.overlay}>
          <Text style={s.scanText}>Apuntá al código QR o de barras</Text>
        </View>
        {scanned && (
          <TouchableOpacity style={s.resetBtn} onPress={() => setScanned(false)}>
            <Text style={s.resetText}>Escanear de nuevo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#fff' },
  overlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  resetBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#0c2b8f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  resetText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
