import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToClients } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test SSE - Simulando mensaje de WhatsApp...');
    
    // Simular un mensaje de WhatsApp
    const testMessage = {
      type: 'whatsapp_message',
      contactId: '+5491135562673',
      id: `test_${Date.now()}`,
      content: `Mensaje de prueba SSE - ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString()
    };
    
    console.log('🧪 Test SSE - Enviando mensaje de prueba:', testMessage);
    
    // Enviar mensaje al SSE
    sendMessageToClients(testMessage);
    
    console.log('✅ Test SSE - Mensaje enviado correctamente');
    
    return NextResponse.json({
      success: true,
      message: 'Mensaje de prueba enviado al SSE',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test SSE - Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error enviando mensaje de prueba'
    }, { status: 500 });
  }
}
