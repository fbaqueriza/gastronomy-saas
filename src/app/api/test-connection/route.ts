import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API /api/test-connection - Probando conexión...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🧪 Variables de entorno:', {
      url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Presente' : '❌ Faltante',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Faltante',
      finalKey: supabaseKey ? '✅ Presente' : '❌ Faltante'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno faltantes' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Probar conexión básica
    console.log('🧪 Probando conexión básica...');
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error de conexión: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Conexión exitosa, providers encontrados:', providers?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa',
      providersCount: providers?.length || 0,
      providers: providers?.slice(0, 3) || [] // Solo los primeros 3
    });
    
  } catch (error) {
    console.error('❌ API test-connection - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
