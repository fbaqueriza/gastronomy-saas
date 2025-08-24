import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/supabase/messaging';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    // console.log(`📖 Marcando mensajes como leídos para conversación: ${conversationId}`);
    
    const success = await MessagingService.markAsRead(conversationId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Error marcando mensajes como leídos' },
        { status: 500 }
      );
    }
    
    // console.log('✅ Mensajes marcados como leídos exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Mensajes marcados como leídos',
      conversation_id: conversationId
    });
    
  } catch (error) {
    console.error('❌ Error marcando mensajes como leídos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
