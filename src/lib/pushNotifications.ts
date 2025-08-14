// Sistema de Push Notifications para WhatsApp

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

// Función para enviar push notification
export async function sendPushNotification(notification: PushNotification) {
  try {
    console.log('🔔 Intentando enviar notificación:', notification.title);
    
    // Verificar si las notificaciones están habilitadas
    if (!areNotificationsEnabled()) {
      console.log('❌ Notificaciones no habilitadas');
      return;
    }

    // Usar la API nativa de Notification para mayor compatibilidad
    if ('Notification' in window) {
      console.log('🔔 Creando notificación nativa...');
      
      const nativeNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico',
        tag: notification.tag || 'whatsapp-message',
        data: notification.data,
        requireInteraction: false, // Cambiar a false para que no requiera interacción
        silent: false
      });

      // Auto-cerrar después de 15 segundos (más tiempo)
      setTimeout(() => {
        nativeNotification.close();
      }, 15000);

      // Manejar clic en la notificación
      nativeNotification.onclick = () => {
        console.log('🔔 Notificación clickeada, enfocando ventana...');
        window.focus();
        nativeNotification.close();
      };

      // También mostrar una alerta temporal en la página
      if (typeof window !== 'undefined') {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10B981;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          font-family: Arial, sans-serif;
          font-size: 14px;
          max-width: 300px;
          animation: slideIn 0.3s ease-out;
        `;
        alertDiv.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 5px;">${notification.title}</div>
          <div>${notification.body}</div>
        `;
        document.body.appendChild(alertDiv);
        
        // Remover después de 5 segundos
        setTimeout(() => {
          if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
          }
        }, 5000);
      }

      console.log('🔔 Push notification enviada exitosamente:', notification.title);
    } else {
      console.log('❌ Notificaciones no soportadas en este navegador');
    }
  } catch (error) {
    console.error('❌ Error enviando push notification:', error);
  }
}

// Función para enviar notificación de mensaje de WhatsApp
export function sendWhatsAppNotification(contactName: string, message: string) {
  console.log(`🔔 Preparando notificación para ${contactName}: ${message}`);
  
  const notification: PushNotification = {
    title: `Nuevo mensaje de ${contactName}`,
    body: message.length > 50 ? message.substring(0, 50) + '...' : message,
    icon: '/favicon.ico',
    tag: 'whatsapp-message',
    data: {
      type: 'whatsapp_message',
      contactName,
      message
    }
  };
  
  // Enviar notificación inmediatamente
  sendPushNotification(notification);
}

// Función para solicitar permisos de notificación
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch (error) {
    console.error('❌ Error solicitando permisos de notificación:', error);
    return false;
  }
}

// Función para verificar si las notificaciones están habilitadas
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}
