import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar las variables de entorno correctas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ API data/providers - Variables de entorno faltantes:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
  try {
    console.log('📥 API data/providers - Obteniendo providers...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ API data/providers - Variables de entorno faltantes');
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración faltante' 
      }, { status: 500 });
    }
    
    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Obtener todos los providers
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ API data/providers - Error obteniendo providers:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo providers',
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ API data/providers - Providers obtenidos:', providers?.length || 0);
    
    return NextResponse.json({
      success: true,
      providers: providers || []
    });
    
  } catch (error) {
    console.error('❌ API data/providers - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error
    }, { status: 500 });
  }
}
