import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/supabase/messaging';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Obteniendo conversaciones');
    
    const conversations = await MessagingService.getConversations();
    
    console.log(`✅ ${conversations.length} conversaciones obtenidas`);
    
    return NextResponse.json({
      success: true,
      conversations,
      total: conversations.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo conversaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
