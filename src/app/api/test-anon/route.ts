import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API test-anon: Probando Anon Key');
    
    // Verificar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('providers')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ API test-anon - Error accediendo a tabla:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error accediendo a tabla: ' + tableError.message 
      }, { status: 500 });
    }
    
    console.log('✅ API test-anon - Tabla accesible con Anon Key');
    
    // Obtener todos los proveedores
    const { data: allProviders, error: providersError } = await supabase
      .from('providers')
      .select('*');
    
    if (providersError) {
      console.error('❌ API test-anon - Error obteniendo providers:', providersError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo providers: ' + providersError.message 
      }, { status: 500 });
    }
    
    console.log('✅ API test-anon - Providers obtenidos:', allProviders?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Anon Key funciona correctamente',
      providersCount: allProviders?.length || 0,
      providers: allProviders || []
    });
    
  } catch (error) {
    console.error('❌ API test-anon - Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
