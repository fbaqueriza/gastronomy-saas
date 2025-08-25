import { NextRequest, NextResponse } from 'next/server';
import { OrderNotificationService } from '../../../../lib/orderNotificationService';

export async function POST(request: NextRequest) {
  try {
    const { providerPhone } = await request.json();

    if (!providerPhone) {
      return NextResponse.json(
        { success: false, error: 'Número de teléfono del proveedor es requerido' },
        { status: 400 }
      );
    }

    console.log('📞 Enviando detalles del pedido manualmente para:', providerPhone);

    const success = await OrderNotificationService.sendOrderDetailsAfterConfirmation(providerPhone);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Detalles del pedido enviados exitosamente'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'No se encontró pedido pendiente para este proveedor' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ Error enviando detalles del pedido:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
