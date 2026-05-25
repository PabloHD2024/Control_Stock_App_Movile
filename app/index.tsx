import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function IndexPage() {
  const { session, loading } = useAuth();

  console.log("Estado en index.tsx -> Loading:", loading, "Session:", !!session);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.text}>Cargando configuración...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 14,
  },
});