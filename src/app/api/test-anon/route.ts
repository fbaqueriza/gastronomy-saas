import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API /api/test-anon - Probando conexión con anon key...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🧪 Variables de entorno:', {
      url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
      anonKey: supabaseKey ? '✅ Presente' : '❌ Faltante'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno faltantes' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Probar conexión básica con anon key
    console.log('🧪 Probando conexión básica con anon key...');
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error de conexión con anon key:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error de conexión: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Conexión exitosa con anon key, providers encontrados:', providers?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa con anon key',
      providersCount: providers?.length || 0,
      providers: providers?.slice(0, 3) || [] // Solo los primeros 3
    });
    
  } catch (error) {
    console.error('❌ API test-anon - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
