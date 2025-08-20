import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';
import { sendMessageToClients } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Real Message - Iniciando prueba...');
    
    // Simular un mensaje real de WhatsApp Business API
    const simulatedMessage = {
      id: `test_${Date.now()}`,
      from: '5491135562673', // Número de prueba
      to: '670680919470999',
      text: {
        body: 'Hola, este es un mensaje de prueba para verificar que el chat funciona correctamente. - ' + new Date().toISOString()
      },
      timestamp: Math.floor(Date.now() / 1000),
      type: 'text'
    };

    console.log('🧪 Test Real Message - Mensaje simulado:', simulatedMessage);

    // Procesar el mensaje como si fuera real
    await metaWhatsAppService.processIncomingMessage(simulatedMessage);
    
    // Enviar mensaje SSE para actualización en tiempo real
    const sseMessage = {
      type: 'whatsapp_message',
      contactId: '5491135562673',
      id: simulatedMessage.id,
      content: simulatedMessage.text.body,
      timestamp: new Date().toISOString()
    };
    
    console.log('🧪 Test Real Message - Enviando mensaje SSE:', sseMessage);
    sendMessageToClients(sseMessage);
    
    console.log('✅ Test Real Message - Prueba completada exitosamente');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje de prueba procesado correctamente',
      messageId: simulatedMessage.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Test Real Message - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
