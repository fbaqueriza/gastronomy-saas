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
    console.log('🔍 API check-rls: Verificando políticas de RLS');
    
    // Verificar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('providers')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ API check-rls - Error accediendo a tabla:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error accediendo a tabla: ' + tableError.message 
      }, { status: 500 });
    }
    
    // Intentar insertar un registro de prueba
    const testProvider = {
      id: 'test-rls-check-' + Date.now(),
      user_id: 'b5a237e6-c9f9-4561-af07-a1408825ab50',
      name: 'Test RLS',
      email: 'test@rls.com',
      phone: '+5491100000000',
      categories: ['test'],
      tags: ['test'],
      catalogs: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔍 API check-rls: Intentando insertar registro de prueba');
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('providers')
      .insert(testProvider);
    
    if (insertError) {
      console.error('❌ API check-rls - Error insertando:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Error insertando: ' + insertError.message,
        rlsBlocked: insertError.message.includes('row-level security') || insertError.message.includes('RLS')
      }, { status: 500 });
    }
    
    console.log('✅ API check-rls - Registro insertado exitosamente');
    
    // Limpiar el registro de prueba
    const { error: deleteError } = await supabaseAdmin
      .from('providers')
      .delete()
      .eq('id', testProvider.id);
    
    if (deleteError) {
      console.error('⚠️ API check-rls - Error eliminando registro de prueba:', deleteError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'RLS no bloquea la inserción',
      rlsBlocked: false
    });
    
  } catch (error) {
    console.error('❌ API check-rls - Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
