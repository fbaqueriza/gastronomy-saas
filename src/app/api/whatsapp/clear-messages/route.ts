import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 CLEAR - Iniciando limpieza de mensajes...');
    
    // Eliminar todos los mensajes de WhatsApp
    const { error } = await supabase
      .from('whatsapp_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos excepto un registro dummy
    
    if (error) {
      console.error('❌ CLEAR - Error eliminando mensajes:', error);
      return NextResponse.json(
        { error: 'Error clearing messages', details: error },
        { status: 500 }
      );
    }
    
    console.log('✅ CLEAR - Mensajes eliminados correctamente');
    
    return NextResponse.json({
      success: true,
      message: 'All WhatsApp messages cleared successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 CLEAR - Error inesperado:', error);
    return NextResponse.json(
      { error: 'Unexpected error clearing messages' },
      { status: 500 }
    );
  }
}
