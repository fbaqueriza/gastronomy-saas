import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API test-supabase-simple - Probando conexión...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🧪 Variables de entorno:', {
      url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
      key: supabaseKey ? '✅ Presente' : '❌ Faltante',
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0
    });
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno faltantes',
        env: { url: !!supabaseUrl, key: !!supabaseKey }
      }, { status: 500 });
    }
    
    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a Supabase',
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ Conexión exitosa');
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a Supabase exitosa',
      data
    });
    
  } catch (error) {
    console.error('❌ Error en test-supabase-simple:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error
    }, { status: 500 });
  }
}
