import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { contactId, message } = await request.json();
    
    console.log('🧪 Test Message: Simulando mensaje entrante:', { contactId, message });
    
    // Simular un mensaje entrante
    const testMessage = {
      id: `test_${Date.now()}`,
      type: 'received',
      content: message || 'Mensaje de prueba',
      timestamp: new Date().toISOString(),
      contactId: contactId,
      status: 'delivered'
    };
    
    // Guardar en la base de datos (opcional)
    // Por ahora solo retornamos el mensaje simulado
    
    return NextResponse.json({
      success: true,
      message: 'Mensaje de prueba enviado',
      data: testMessage
    });
    
  } catch (error) {
    console.error('Error en test-message:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
