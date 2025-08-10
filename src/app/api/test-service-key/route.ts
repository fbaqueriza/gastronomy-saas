import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API /api/test-service-key - Probando service role key específica...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YWxtZGh5dWZ0amxkZXdiZnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM5MjQzMywiZXhwIjoyMDY4OTY4NDMzfQ.5VNMM8f_DS81lgtiODLBV_lUyk2AzoKDz5PltSGe9io';
    
    console.log('🧪 Variables de entorno:', {
      url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
      serviceKey: serviceRoleKey ? '✅ Presente' : '❌ Faltante',
      serviceKeyLength: serviceRoleKey?.length || 0
    });
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno faltantes' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Probar conexión básica con service role key
    console.log('🧪 Probando conexión básica con service role key...');
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error de conexión con service role key:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error de conexión: ' + error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ Conexión exitosa con service role key, providers encontrados:', providers?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa con service role key',
      providersCount: providers?.length || 0,
      providers: providers?.slice(0, 3) || [] // Solo los primeros 3
    });
    
  } catch (error) {
    console.error('❌ API test-service-key - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
