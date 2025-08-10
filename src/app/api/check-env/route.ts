import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/check-env - Verificando variables de entorno...');
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    
    console.log('🔍 Variables de entorno:', {
      url: envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ Faltante',
      anonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Faltante',
      serviceKey: envVars.SUPABASE_SERVICE_ROLE_KEY ? '✅ Presente' : '❌ Faltante',
      urlLength: envVars.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      anonKeyLength: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      serviceKeyLength: envVars.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    });
    
    return NextResponse.json({
      success: true,
      env: {
        url: envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ Faltante',
        anonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Faltante',
        serviceKey: envVars.SUPABASE_SERVICE_ROLE_KEY ? '✅ Presente' : '❌ Faltante',
        urlLength: envVars.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        anonKeyLength: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceKeyLength: envVars.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      }
    });
    
  } catch (error) {
    console.error('❌ API check-env - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
