import { NextRequest, NextResponse } from 'next/server';
import { MetaConversationTriggers } from '../../../../lib/metaConversationTriggers';

const conversationTriggers = new MetaConversationTriggers();

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, orderDetails } = await request.json();

    if (!phoneNumber || !orderDetails) {
      return NextResponse.json({ 
        error: 'phoneNumber y orderDetails son requeridos' 
      }, { status: 400 });
    }

    // Validar que el número de teléfono tenga el formato correcto
    const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Transformar los datos para que coincidan con la interfaz OrderDetails
    const transformedOrderDetails = {
      id: orderDetails.orderId || orderDetails.id,
      providerName: orderDetails.provider || orderDetails.providerName,
      items: orderDetails.items || [],
      deliveryDate: orderDetails.date || orderDetails.deliveryDate,
      deliveryLocation: orderDetails.location || orderDetails.deliveryLocation,
      paymentMethod: orderDetails.paymentMethod || 'Efectivo',
      totalAmount: parseFloat(orderDetails.amount) || 0,
      status: orderDetails.status || 'Pendiente'
    };

    // Enviar disparador de conversación y detalles de la orden
    const success = await conversationTriggers.sendOrderTrigger(normalizedPhone, transformedOrderDetails);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Orden enviada con disparador de conversación' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Error enviando orden' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error en send-order:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
