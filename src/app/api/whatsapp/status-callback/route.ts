import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Log del status callback para debugging
    console.log('Status callback received:', {
      messageSid: formData.get('MessageSid'),
      messageStatus: formData.get('MessageStatus'),
      to: formData.get('To'),
      from: formData.get('From'),
      timestamp: new Date().toISOString()
    });

    // Responder con 200 OK para confirmar recepción
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in status callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 