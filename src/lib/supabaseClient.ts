import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logs
console.log('DEBUG: supabaseUrl:', supabaseUrl);
console.log('DEBUG: supabaseAnonKey:', supabaseAnonKey ? 'EXISTS' : 'MISSING');

// Verificar que las variables estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Las variables de entorno de Supabase no están configuradas');
  throw new Error('Supabase configuration missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 