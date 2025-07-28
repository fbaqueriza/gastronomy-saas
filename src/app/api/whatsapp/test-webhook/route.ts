import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST WEBHOOK - Simulando mensaje entrante de Twilio');
    
    // Simular datos de un webhook de Twilio
    const testData = {
      MessageSid: 'TEST_' + Date.now(),
      From: 'whatsapp:+5491135562673',
      To: 'whatsapp:+14155238886',
      Body: 'Mensaje de prueba desde webhook simulado',
      MessageStatus: 'received'
    };
    
    console.log('🧪 Datos de prueba:', testData);
    
    // Hacer POST al webhook real
    const webhookUrl = 'http://localhost:3001/api/whatsapp/twilio/webhook';
    const formData = new FormData();
    formData.append('MessageSid', testData.MessageSid);
    formData.append('From', testData.From);
    formData.append('To', testData.To);
    formData.append('Body', testData.Body);
    formData.append('MessageStatus', testData.MessageStatus);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.text();
    console.log('🧪 Respuesta del webhook:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook simulado enviado',
      webhookResponse: result
    });
    
  } catch (error) {
    console.error('Error en test webhook:', error);
    return NextResponse.json({ error: 'Error en test webhook' }, { status: 500 });
  }
} 