import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

// Exponemos "role" en inglés para que coincida con tus pantallas existentes (como tu UsuariosScreen)
interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  role: 'admin' | 'user' | null; 
  loading: boolean;
  signOut: () => Promise<void>;   
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el rol desde la tabla de perfiles de la base de datos
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('rol') 
        .eq('id', userId)
        .single();

      // CORREGIDO: Mapeamos el dato que viene en español ('rol') al estado en inglés ('role')
      if (data && !error) {
        setRole(data.rol as 'admin' | 'user');
      } else {
        if (error) console.log("Nota al traer rol (se usará 'user'):", error.message);
        setRole('user'); // Rol por defecto si no se encuentra perfil
      }
    } catch (err) {
      console.error("Error al obtener el rol del usuario:", err);
      setRole('user');
    }
  };

  useEffect(() => {
    // Chequear sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    // Escuchar cambios de estado (Login, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id).finally(() => setLoading(false));
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función global para cerrar sesión de forma segura
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      role, // CORREGIDO: Ahora matchea perfectamente con la interfaz AuthContextType
      loading, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);