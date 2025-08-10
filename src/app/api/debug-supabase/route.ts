import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/debug-supabase - Diagnóstico de Supabase...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 Variables de entorno:', {
      url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Presente' : '❌ Faltante',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Faltante',
      finalKey: supabaseKey ? '✅ Presente' : '❌ Faltante',
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      finalKeyLength: supabaseKey?.length || 0
    });
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno faltantes',
        env: { url: !!supabaseUrl, key: !!supabaseKey }
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Probar conexión básica
    console.log('🔍 Probando conexión básica...');
    const { data: testData, error: testError } = await supabase
      .from('providers')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error de conexión: ' + testError.message,
        details: testError
      }, { status: 500 });
    }
    
    // Intentar obtener todos los proveedores
    console.log('🔍 Obteniendo todos los proveedores...');
    const { data: allProviders, error: providersError } = await supabase
      .from('providers')
      .select('*');
    
    if (providersError) {
      console.error('❌ Error obteniendo providers:', providersError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo providers: ' + providersError.message,
        details: providersError
      }, { status: 500 });
    }
    
    // Intentar obtener usuarios
    console.log('🔍 Obteniendo usuarios...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error obteniendo users:', usersError);
    }
    
    console.log('✅ Diagnóstico completado');
    
    return NextResponse.json({
      success: true,
      connection: '✅ Conectado',
      providers: {
        count: allProviders?.length || 0,
        data: allProviders?.slice(0, 3) || [], // Solo los primeros 3 para no saturar
        error: providersError?.message || null
      },
      users: {
        count: users?.length || 0,
        data: users?.slice(0, 3) || [], // Solo los primeros 3
        error: usersError?.message || null
      },
      env: {
        url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
        keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon',
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        finalKeyLength: supabaseKey?.length || 0
      }
    });
    
  } catch (error) {
    console.error('❌ API debug-supabase - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message
    }, { status: 500 });
  }
}
