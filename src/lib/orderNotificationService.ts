import { Order, OrderItem, Provider } from '../types';

interface OrderNotificationData {
  order: Order;
  provider: Provider;
  items: OrderItem[];
}

export class OrderNotificationService {
  /**
   * Envía notificación automática de nuevo pedido al proveedor
   */
  static async sendOrderNotification(data: OrderNotificationData): Promise<boolean> {
    try {
      const { order, provider, items } = data;
      
      // Normalizar el número de teléfono del proveedor
      let normalizedPhone = provider.phone.replace(/[\s\-\(\)]/g, '');
      if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = `+${normalizedPhone}`;
      }

      console.log('📦 Iniciando envío de pedido a:', provider.name);
      console.log('📱 Número normalizado:', normalizedPhone);

      // PASO 1: Disparar conversación de Meta usando template configurado
      console.log('🔗 Disparando conversación de Meta con template...');
      const triggerResponse = await fetch('/api/whatsapp/trigger-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          template_name: 'envio_de_orden'
        }),
      });

      const triggerResult = await triggerResponse.json();
      console.log('📋 Resultado del trigger:', triggerResult);
      
      if (!triggerResponse.ok) {
        console.error('❌ Error disparando conversación de Meta:', triggerResult);
        return false;
      }

      console.log('✅ Conversación de Meta disparada exitosamente con template');

      // PASO 2: Esperar un momento y enviar el mensaje detallado del pedido
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const orderMessage = this.createOrderMessage(order, provider, items);
            
            console.log('📝 Enviando detalles completos del pedido...');
            
            const messageResponse = await fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: normalizedPhone,
                message: orderMessage
              }),
            });

            const messageResult = await messageResponse.json();
            
            if (messageResponse.ok) {
              console.log('✅ Detalles del pedido enviados exitosamente a:', provider.name);
              resolve(true);
            } else {
              console.error('❌ Error enviando detalles del pedido:', messageResult);
              resolve(false);
            }
          } catch (error) {
            console.error('❌ Error enviando detalles del pedido:', error);
            resolve(false);
          }
        }, 2000); // Esperar 2 segundos entre el trigger y el mensaje
      });

    } catch (error) {
      console.error('❌ Error en sendOrderNotification:', error);
      return false;
    }
  }

  /**
   * Crea el mensaje formateado del pedido
   */
  private static createOrderMessage(order: Order, provider: Provider, items: OrderItem[]): string {
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const itemsList = items.map(item => 
      `• ${item.productName}: ${item.quantity} ${item.unit} - $${item.total}`
    ).join('\n');

    let message = `🛒 *NUEVO PEDIDO*\n\n`;
    message += `*Proveedor:* ${provider.name}\n`;
    message += `*Fecha:* ${new Date().toLocaleDateString('es-AR')}\n`;
    message += `*Total:* $${totalAmount.toLocaleString()}\n\n`;
    message += `*Productos:*\n${itemsList}`;

    if (order.desiredDeliveryDate) {
      message += `\n\n*Fecha de entrega deseada:* ${new Date(order.desiredDeliveryDate).toLocaleDateString('es-AR')}`;
    }

    if (order.paymentMethod) {
      message += `\n*Método de pago:* ${order.paymentMethod}`;
    }

    if (order.notes) {
      message += `\n\n*Notas:* ${order.notes}`;
    }

    message += `\n\n_Por favor confirma la recepción de este pedido._`;

    return message;
  }

  /**
   * Envía notificación de actualización de estado del pedido
   */
  static async sendOrderStatusUpdate(
    order: Order, 
    provider: Provider, 
    status: string
  ): Promise<boolean> {
    try {
      let normalizedPhone = provider.phone.replace(/[\s\-\(\)]/g, '');
      if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = `+${normalizedPhone}`;
      }

      const statusMessages = {
        'enviado': '📤 *PEDIDO ENVIADO*\n\nTu pedido ha sido enviado al proveedor.',
        'factura_recibida': '📄 *FACTURA RECIBIDA*\n\nEl proveedor ha enviado la factura.',
        'pagado': '💳 *PEDIDO PAGADO*\n\nEl pago ha sido confirmado.',
        'finalizado': '✅ *PEDIDO FINALIZADO*\n\nEl pedido ha sido completado exitosamente.',
        'cancelled': '❌ *PEDIDO CANCELADO*\n\nEl pedido ha sido cancelado.'
      };

      const statusMessage = statusMessages[status as keyof typeof statusMessages] || 
        `📋 *ACTUALIZACIÓN DE PEDIDO*\n\nEstado actualizado a: ${status}`;

      const message = `${statusMessage}\n\n*Pedido:* ${order.orderNumber || 'N/A'}\n*Proveedor:* ${provider.name}`;

      const response = await fetch('/api/whatsapp/trigger-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          message: message
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error enviando actualización de estado:', result);
        return false;
      }

      console.log('✅ Actualización de estado enviada exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error en sendOrderStatusUpdate:', error);
      return false;
    }
  }
}
