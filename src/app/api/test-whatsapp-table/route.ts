import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
  try {
    // Intentar obtener información de la tabla
    const { data: tableInfo, error: tableError } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Error accediendo a la tabla whatsapp_messages',
        details: tableError.message,
        code: tableError.code,
        hint: tableError.hint
      }, { status: 500 });
    }

    // Intentar obtener el conteo total
    const { count, error: countError } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        success: false,
        error: 'Error contando mensajes',
        details: countError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      messageCount: count || 0,
      sampleData: tableInfo || [],
      message: 'Tabla whatsapp_messages existe y es accesible'
    });

  } catch (error) {
    console.error('Error en test-whatsapp-table:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
