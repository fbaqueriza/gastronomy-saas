import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Eliminar mensajes promocionales de WhatsApp Business
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .delete()
      .or('content.ilike.%Lean into convenience%,content.ilike.%Discover a new way%,content.ilike.%Get started%')
      .select('id, content');

    if (error) {
      console.error('❌ Error eliminando mensajes promocionales:', error);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando mensajes promocionales',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Mensajes promocionales eliminados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('📋 Mensajes eliminados:', data.map(m => ({ id: m.id, content: m.content?.substring(0, 50) + '...' })));
    }

    return NextResponse.json({
      success: true,
      message: 'Mensajes promocionales eliminados',
      deletedCount: data?.length || 0,
      deletedMessages: data
    });

  } catch (error) {
    console.error('❌ Error en cleanup-promotional:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
