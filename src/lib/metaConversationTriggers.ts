interface OrderDetails {
  id: string;
  providerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
  }>;
  deliveryDate: string;
  deliveryLocation: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
}

interface ConversationTriggerData {
  trigger: string;
  language: string;
  components: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text?: string;
      date?: string;
      currency?: {
        amount: number;
        code: string;
      };
    }>;
  }>;
}

export class MetaConversationTriggers {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_API_KEY!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  }

  // Enviar disparador de conversación para nueva orden
  async sendOrderTrigger(phoneNumber: string, orderDetails: OrderDetails): Promise<boolean> {
    try {
      // Primero enviar el disparador de conversación
      const triggerData: ConversationTriggerData = {
        trigger: "order_confirmation",
        language: "es",
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                text: `Pedido #${orderDetails.id}`
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: orderDetails.providerName
              },
              {
                type: "text",
                text: orderDetails.deliveryDate
              },
              {
                type: "text",
                text: orderDetails.deliveryLocation
              },
              {
                type: "currency",
                currency: {
                  amount: orderDetails.totalAmount * 100, // Meta requiere el monto en centavos
                  code: "ARS"
                }
              }
            ]
          }
        ]
      };

      const triggerResponse = await this.sendConversationTrigger(phoneNumber, triggerData);
      
      if (!triggerResponse) {
        console.error('Error enviando disparador de conversación');
        return false;
      }

      // Esperar un momento antes de enviar los detalles
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Luego enviar los detalles completos de la orden
      const orderMessage = this.formatOrderMessage(orderDetails);
      const messageResponse = await this.sendTextMessage(phoneNumber, orderMessage);

      return messageResponse;
    } catch (error) {
      console.error('Error enviando disparador de orden:', error);
      return false;
    }
  }

  // Enviar disparador de conversación genérico
  private async sendConversationTrigger(phoneNumber: string, data: ConversationTriggerData): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: data
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error enviando disparador:', result);
        return false;
      }

      console.log('✅ Disparador de conversación enviado:', result);
      return true;
    } catch (error) {
      console.error('Error enviando disparador de conversación:', error);
      return false;
    }
  }

  // Enviar mensaje de texto
  private async sendTextMessage(phoneNumber: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: text
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error enviando mensaje de texto:', result);
        return false;
      }

      console.log('✅ Mensaje de texto enviado:', result);
      return true;
    } catch (error) {
      console.error('Error enviando mensaje de texto:', error);
      return false;
    }
  }

  // Formatear mensaje de orden
  private formatOrderMessage(orderDetails: OrderDetails): string {
    const itemsList = orderDetails.items
      .map(item => `• ${item.productName}: ${item.quantity} ${item.unit}`)
      .join('\n');

    return `📋 *DETALLES DEL PEDIDO #${orderDetails.id}*

🏪 *Proveedor:* ${orderDetails.providerName}
📅 *Fecha de entrega:* ${orderDetails.deliveryDate}
📍 *Lugar de entrega:* ${orderDetails.deliveryLocation}
💳 *Método de pago:* ${orderDetails.paymentMethod}
💰 *Monto total:* $${orderDetails.totalAmount.toLocaleString()}

📦 *Productos:*
${itemsList}

📊 *Estado:* ${orderDetails.status}

¿Necesitas alguna modificación o tienes alguna pregunta sobre este pedido?`;
  }

  // Enviar notificación de cambio de estado
  async sendStatusUpdate(phoneNumber: string, orderId: string, newStatus: string, additionalInfo?: string): Promise<boolean> {
    try {
      const statusMessages = {
        'pending': '⏳ Tu pedido está siendo procesado',
        'sent': '📤 Tu pedido ha sido enviado',
        'delivered': '✅ Tu pedido ha sido entregado',
        'cancelled': '❌ Tu pedido ha sido cancelado'
      };

      const message = `${statusMessages[newStatus as keyof typeof statusMessages] || '📋 Estado actualizado'}

🆔 *Pedido:* #${orderId}
📊 *Nuevo estado:* ${newStatus}
${additionalInfo ? `\nℹ️ *Información adicional:* ${additionalInfo}` : ''}`;

      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error enviando actualización de estado:', error);
      return false;
    }
  }
}
