import { NextRequest, NextResponse } from 'next/server';
import { OrderNotificationService } from '../../../../lib/orderNotificationService';

export async function POST(request: NextRequest) {
  try {
    const { providerId } = await request.json();

    console.log('🧪 TEST - Probando notificación de pedido para proveedor:', providerId);

    if (!providerId) {
      return NextResponse.json(
        { error: 'Missing required field: providerId' },
        { status: 400 }
      );
    }

    // Crear datos de prueba
    const mockOrder = {
      id: 'test-order-123',
      orderNumber: 'ORD-TEST-001',
      providerId: providerId,
      items: [
        {
          productName: 'Producto de Prueba',
          quantity: 5,
          unit: 'kg',
          price: 200,
          total: 1000
        }
      ],
      status: 'pending',
      totalAmount: 1000,
      currency: 'ARS',
      orderDate: new Date(),
      notes: 'Pedido de prueba'
    };

    const mockProvider = {
      id: providerId,
      name: 'Proveedor de Prueba',
      phone: '+5491135562673',
      contact_name: 'Juan'
    };

    console.log('📤 TEST - Enviando notificación de pedido de prueba...');
    
    const result = await OrderNotificationService.sendOrderNotification({
      order: mockOrder as any,
      provider: mockProvider as any,
      items: mockOrder.items
    });

    console.log('📋 TEST - Resultado de notificación:', result);

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Notificación de pedido enviada exitosamente',
        order: mockOrder,
        provider: mockProvider
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send order notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 TEST - Error:', error);
    return NextResponse.json(
      { error: 'Error sending order notification test' },
      { status: 500 }
    );
  }
}
