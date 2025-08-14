import { useEffect, useState, useCallback } from 'react';

export function useWhatsAppNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('❌ Notificaciones no soportadas en este navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log(`✅ Permiso de notificaciones: ${result}`);
      return result === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permiso de notificaciones:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported) {
      console.log('❌ Notificaciones no soportadas');
      return;
    }

    if (permission !== 'granted') {
      console.log('❌ Permiso de notificaciones no concedido');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'whatsapp-message',
        requireInteraction: false,
        silent: false,
        ...options
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Manejar clic en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('🔔 Notificación mostrada:', title);
      return notification;
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }, [isSupported, permission]);

  const showMessageNotification = useCallback((contactName: string, message: string) => {
    const title = `Nuevo mensaje de ${contactName}`;
    const options: NotificationOptions = {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'whatsapp-message',
      requireInteraction: false,
      silent: false,
      data: {
        type: 'whatsapp-message',
        contactName,
        message
      }
    };

    return showNotification(title, options);
  }, [showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showMessageNotification
  };
}
