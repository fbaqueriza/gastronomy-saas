import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-table: Verificando estructura de tabla providers');
    
    // Verificar si la tabla existe y obtener su estructura
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('providers')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ API check-table - Error accediendo a tabla:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error accediendo a tabla: ' + tableError.message 
      }, { status: 500 });
    }
    
    // Obtener todos los proveedores existentes
    const { data: allProviders, error: providersError } = await supabaseAdmin
      .from('providers')
      .select('*');
    
    if (providersError) {
      console.error('❌ API check-table - Error obteniendo providers:', providersError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo providers: ' + providersError.message 
      }, { status: 500 });
    }
    
    console.log('✅ API check-table - Tabla accesible, providers encontrados:', allProviders?.length || 0);
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      providersCount: allProviders?.length || 0,
      sampleProvider: allProviders?.[0] || null,
      allProviders: allProviders || []
    });
    
  } catch (error) {
    console.error('❌ API check-table - Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
