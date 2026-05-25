import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tus credenciales reales del panel de Supabase
const supabaseUrl = 'https://zzdycqxhgvdizmbnqigl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6ZHljcXhoZ3ZkaXptYm5xaWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjY0NTIsImV4cCI6MjA5NDk0MjQ1Mn0.mdRTZbznoCKYKrBM8tuQRO5PlpcjT4QHTHEL3tZTnX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});