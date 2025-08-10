import { NextRequest, NextResponse } from 'next/server';
// import { sendToAllClients } from '../sse/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, content, messageId } = body;

    if (!contactId || !content) {
      return NextResponse.json({ 
        error: 'contactId and content are required' 
      }, { status: 400 });
    }

    console.log('🧪 Test Incoming - Simulando mensaje entrante:', { contactId, content, messageId });

    // Normalizar el número de teléfono
    let normalizedContactId = contactId;
    if (normalizedContactId && !normalizedContactId.startsWith('+')) {
      normalizedContactId = `+${normalizedContactId}`;
    }

    // Crear mensaje SSE simulado
    const sseMessage = {
      type: 'whatsapp_message',
      contactId: normalizedContactId,
      id: messageId || `test_${Date.now()}`,
      content: content,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Test Incoming - Enviando mensaje SSE simulado:', sseMessage);

    // Enviar a todos los clientes conectados
    // sendToAllClients(sseMessage); // Comentado temporalmente

    console.log('✅ Test Incoming - Mensaje simulado enviado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Mensaje simulado enviado',
      data: sseMessage
    });

  } catch (error) {
    console.error('💥 Error en test incoming:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
