import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getDB } from '../../lib/database';
import CustomHeader from '../customHeader';

interface Stats {
  totalEquipos: number;
  disponibles: number;
  activos: number;
  enReparacion: number;
  totalClientes: number;
  totalMovimientos: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const isAdmin = session?.user?.rol === 'admin';
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const db = await getDB();
      const equiposData: any[] = await db.getAllAsync(`SELECT estado FROM equipos`);
      const clientesData: any[] = await db.getAllAsync(`SELECT id FROM clientes WHERE id != 1`);
      const movData: any[] = await db.getAllAsync(`SELECT id FROM equipment_logs`);

      setStats({
        totalEquipos: equiposData.length,
        disponibles: equiposData.filter(e => e.estado?.toLowerCase() === 'disponible').length,
        activos: equiposData.filter(e => e.estado?.toLowerCase() === 'activo').length,
        enReparacion: equiposData.filter(e => e.estado?.toLowerCase() === 'en reparación').length,
        totalClientes: clientesData.length,
        totalMovimientos: movData.length,
      });
    } catch (e: any) {
      console.error('Error cargando stats:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchStats();
  }, []));

  const accesos = [
    { label: 'Escanear QR', icon: 'qr-code-outline', route: '/(tabs)/scanner', color: '#0c2b8f' },
    { label: 'Ver Equipos', icon: 'cube-outline', route: '/(tabs)/equipos', color: '#28a745' },
    { label: 'Movimientos', icon: 'swap-horizontal-outline', route: '/(tabs)/movimientos', color: '#fd7e14' },
    { label: 'Clientes', icon: 'business-outline', route: '/(tabs)/clientes', color: '#6f42c1' },
    ...(isAdmin ? [
      { label: 'Alta Equipo', icon: 'add-circle-outline', route: '/(tabs)/admin', color: '#dc3545' },
      { label: 'Usuarios', icon: 'people-outline', route: '/(tabs)/usuarios', color: '#20c997' },
    ] : []),
  ];

  return (
    <View style={s.container}>
      <CustomHeader title="Inicio" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Bienvenida */}
        <View style={s.welcomeCard}>
          <View style={s.welcomeIconWrap}>
            <Ionicons name="print-outline" size={32} color="#0c2b8f" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.welcomeTitle}>Control de Activos</Text>
            <Text style={s.welcomeSub}>
              Bienvenido,{' '}
              <Text style={s.welcomeEmail}>{session?.user?.email?.split('@')[0]}</Text>
              {isAdmin ? '  ·  Admin' : '  ·  Usuario'}
            </Text>
          </View>
        </View>

        {/* Resumen estadísticas */}
        <Text style={s.sectionTitle}>Resumen</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0c2b8f" style={{ marginTop: 12 }} />
        ) : (
          <View style={s.statsGrid}>
            <StatCard label="Total equipos" value={stats?.totalEquipos ?? 0} icon="cube" color="#0c2b8f" />
            <StatCard label="Disponibles" value={stats?.disponibles ?? 0} icon="checkmark-circle" color="#28a745" />
            <StatCard label="Activos" value={stats?.activos ?? 0} icon="flash" color="#007bff" />
            <StatCard label="En reparación" value={stats?.enReparacion ?? 0} icon="build" color="#ffc107" />
            <StatCard label="Clientes" value={stats?.totalClientes ?? 0} icon="business" color="#6f42c1" />
            <StatCard label="Movimientos" value={stats?.totalMovimientos ?? 0} icon="swap-horizontal" color="#fd7e14" />
          </View>
        )}

        {/* Accesos rápidos */}
        <Text style={s.sectionTitle}>Acceso rápido</Text>
        <View style={s.accessGrid}>
          {accesos.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={s.accessCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={[s.accessIconWrap, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={s.accessLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info de la app */}
        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#6c757d" />
          <Text style={s.infoText}>
            Gestioná equipos, registrá movimientos y controlá el stock desde un solo lugar.
            Escaneá el código QR o de barras de cualquier equipo para acceder rápidamente a su ficha.
          </Text>
        </View>

        <Text style={s.version}>v1.0.0  ·  Base de datos local SQLite</Text>

      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <View style={[sc.card, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={20} color={color} style={{ marginBottom: 4 }} />
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  scroll: { padding: 16, paddingBottom: 32 },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e3e6ec',
    elevation: 2,
  },
  welcomeIconWrap: {
    backgroundColor: '#e8edf8',
    borderRadius: 10,
    padding: 10,
  },
  welcomeTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c2b8f' },
  welcomeSub: { fontSize: 13, color: '#6c757d', marginTop: 3 },
  welcomeEmail: { fontWeight: '700', color: '#333' },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
    marginBottom: 20,
  },

  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
    marginBottom: 20,
  },
  accessCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e6ec',
    elevation: 1,
  },
  accessIconWrap: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  accessLabel: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },

  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d0d8f0',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: '#495057', lineHeight: 19 },

  version: { textAlign: 'center', fontSize: 11, color: '#adb5bd' },
});

const sc = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e3e6ec',
    borderLeftWidth: 4,
    elevation: 1,
  },
  value: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  label: { fontSize: 11, color: '#6c757d', marginTop: 2 },
});
