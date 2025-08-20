import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API test-keys: Verificando claves de Supabase');
    
    // Verificar variables de entorno
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔍 API test-keys: URL:', url);
    console.log('🔍 API test-keys: Anon Key presente:', !!anonKey);
    console.log('🔍 API test-keys: Service Key presente:', !!serviceKey);
    
    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json({
        success: false,
        error: 'Faltan variables de entorno',
        url: !!url,
        anonKey: !!anonKey,
        serviceKey: !!serviceKey
      }, { status: 500 });
    }
    
    // Probar cliente anon
    const supabaseAnon = createClient(url, anonKey);
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('providers')
      .select('*')
      .limit(1);
    
    console.log('🔍 API test-keys: Cliente anon - Error:', anonError);
    console.log('🔍 API test-keys: Cliente anon - Data:', anonData);
    
    // Probar cliente service role
    const supabaseService = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('providers')
      .select('*')
      .limit(1);
    
    console.log('🔍 API test-keys: Cliente service - Error:', serviceError);
    console.log('🔍 API test-keys: Cliente service - Data:', serviceData);
    
    return NextResponse.json({
      success: true,
      anon: {
        error: anonError?.message || null,
        data: anonData || []
      },
      service: {
        error: serviceError?.message || null,
        data: serviceData || []
      }
    });
    
  } catch (error) {
    console.error('❌ API test-keys - Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
