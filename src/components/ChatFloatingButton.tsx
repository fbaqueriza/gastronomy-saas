'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

interface ChatFloatingButtonProps {
  onOpenChat: () => void;
}

export default function ChatFloatingButton({ onOpenChat }: ChatFloatingButtonProps) {
  // Usar el contexto real del chat
  const { unreadCounts, isChatOpen } = useChat();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);

  // Calcular total de mensajes no leídos
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    setTotalUnread(total);
  }, [unreadCounts]);

  // Mostrar notificación cuando hay nuevos mensajes
  useEffect(() => {
    if (totalUnread > 0 && !isChatOpen) {
      setShowNotification(true);
      setNotificationMessage(`${totalUnread} mensaje${totalUnread > 1 ? 's' : ''} nuevo${totalUnread > 1 ? 's' : ''}`);
      
      // Ocultar notificación después de 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [totalUnread, isChatOpen]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onOpenChat}
          className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Abrir chat de WhatsApp"
        >
          <MessageSquare className="h-6 w-6" />
          
          {/* Badge de mensajes no leídos */}
          {totalUnread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Notificación flotante */}
      {showNotification && (
        <div className="fixed bottom-24 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Nuevos mensajes
              </p>
              <p className="text-sm text-gray-500">
                {notificationMessage}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}