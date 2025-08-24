import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/supabase/messaging';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`📨 Obteniendo mensajes para conversación: ${conversationId}`);
    
    const messages = await MessagingService.getMessages(conversationId, limit);
    
    console.log(`✅ ${messages.length} mensajes obtenidos`);
    
    return NextResponse.json({
      success: true,
      messages,
      conversation_id: conversationId,
      total: messages.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
