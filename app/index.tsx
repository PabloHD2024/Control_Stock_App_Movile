import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import styles from './styles/styles';

export default function IndexPage() {
  const { session, loading } = useAuth();

  console.log("Estado en index.tsx -> Loading:", loading, "Session:", !!session);

  if (loading) {
    return (
      <View style={styles.container_Index}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.text_Index}>Cargando configuración...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/login" />;
  }
}