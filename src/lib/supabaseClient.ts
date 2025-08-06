import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logs
console.log('DEBUG: supabaseUrl:', supabaseUrl);
console.log('DEBUG: supabaseAnonKey:', supabaseAnonKey ? 'EXISTS' : 'MISSING');

// Verificar que las variables estén disponibles
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('WARNING: Las variables de entorno de Supabase no están configuradas - usando modo sin base de datos');
  // Crear un cliente mock para evitar errores
  supabase = {
    from: () => ({
      insert: async () => ({ error: null }),
      select: async () => ({ data: [], error: null }),
      order: () => ({
        limit: () => ({ data: [], error: null })
      })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase; 