import { useEffect, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';

export function useWhatsAppNotifications() {
  const { messagesByContact, isChatOpen } = useChat();

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Mostrar notificación de nuevo mensaje
  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted' && !isChatOpen) {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'whatsapp-message',
        requireInteraction: false,
        silent: false
      });
    }
  }, [isChatOpen]);

  // Detectar nuevos mensajes y mostrar notificaciones
  useEffect(() => {
    const totalMessages = Object.values(messagesByContact).reduce(
      (total, messages) => total + messages.length, 
      0
    );

    // Solo mostrar notificación si hay mensajes y el chat no está abierto
    if (totalMessages > 0 && !isChatOpen) {
      const unreadMessages = Object.values(messagesByContact).reduce(
        (total, messages) => total + messages.filter(m => m.type === 'received').length,
        0
      );

      if (unreadMessages > 0) {
        showNotification(
          'Nuevo mensaje de WhatsApp',
          `${unreadMessages} mensaje${unreadMessages > 1 ? 's' : ''} nuevo${unreadMessages > 1 ? 's' : ''}`,
          '/favicon.ico'
        );
      }
    }
  }, [messagesByContact, isChatOpen, showNotification]);

  // Solicitar permisos al cargar
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    requestNotificationPermission,
    showNotification
  };
}
