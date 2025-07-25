import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug logs
console.log('DEBUG: supabaseUrl:', supabaseUrl);
console.log('DEBUG: supabaseAnonKey:', supabaseAnonKey ? 'EXISTS' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 