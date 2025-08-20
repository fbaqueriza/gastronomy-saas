'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
      } else {
        console.log('❌ Permisos de notificación denegados');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Bell className="h-4 w-4" />
        <span className="text-sm">Notificaciones activadas</span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <BellOff className="h-4 w-4" />
        <span className="text-sm">Notificaciones bloqueadas</span>
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
    >
      <Bell className="h-4 w-4" />
      <span className="text-sm">Activar notificaciones</span>
    </button>
  );
}
