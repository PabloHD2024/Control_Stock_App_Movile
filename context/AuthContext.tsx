import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase, seedDatabase, getDB } from '../lib/database';

interface LocalSession {
  user: {
    id: string;
    email: string;
    rol: string;
  };
}

interface AuthContextType {
  session: LocalSession | null;
  loading: boolean;
  loginLocal: (email: string, password: string) => Promise<{ error: string | null }>;
  logoutLocal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        // ✅ Primero inicializamos la BD, luego recuperamos la sesión
        await initializeDatabase();
        await seedDatabase();
        const savedSession = await AsyncStorage.getItem('@local_session');
        if (savedSession) {
          setSession(JSON.parse(savedSession));
        }
      } catch (e) {
        console.error("Error en setup inicial:", e);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  const loginLocal = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const cleanEmail = email.trim().toLowerCase();
    try {
      const db = await getDB();
      const perfil: any = await db.getFirstAsync(
        `SELECT * FROM perfiles WHERE email = ? AND password = ? LIMIT 1;`,
        [cleanEmail, password]
      );
      if (!perfil) {
        return { error: 'Credenciales incorrectas. Verificá tu correo y contraseña.' };
      }
      const mockSession: LocalSession = {
        user: { id: perfil.id.toString(), email: perfil.email, rol: perfil.rol },
      };
      await AsyncStorage.setItem('@local_session', JSON.stringify(mockSession));
      setSession(mockSession);
      return { error: null };
    } catch (e: any) {
      console.error("Error en loginLocal:", e);
      return { error: 'Error interno al verificar las credenciales.' };
    }
  };

  const logoutLocal = async () => {
    try {
      await AsyncStorage.removeItem('@local_session');
      setSession(null);
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, loginLocal, logoutLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}
