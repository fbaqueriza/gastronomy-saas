import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API test-env-only - Verificando variables de entorno...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🧪 Variables de entorno:', {
      url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
      anonKey: supabaseAnonKey ? '✅ Presente' : '❌ Faltante',
      serviceKey: supabaseServiceKey ? '✅ Presente' : '❌ Faltante',
      urlLength: supabaseUrl?.length || 0,
      anonKeyLength: supabaseAnonKey?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0
    });
    
    return NextResponse.json({
      success: true,
      message: 'Variables de entorno verificadas',
      env: {
        url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
        anonKey: supabaseAnonKey ? '✅ Presente' : '❌ Faltante',
        serviceKey: supabaseServiceKey ? '✅ Presente' : '❌ Faltante',
        urlLength: supabaseUrl?.length || 0,
        anonKeyLength: supabaseAnonKey?.length || 0,
        serviceKeyLength: supabaseServiceKey?.length || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error en test-env-only:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error
    }, { status: 500 });
  }
}
