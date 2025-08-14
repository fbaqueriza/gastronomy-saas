'use client';

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, areNotificationsEnabled } from '../lib/pushNotifications';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    const isSupported = 'Notification' in window;
    setIsSupported(isSupported);
    
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  if (!isSupported) {
    return null; // No mostrar nada si no está soportado
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Bell className="w-4 h-4" />
        <span className="text-sm">Notificaciones activadas</span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <BellOff className="w-4 h-4" />
        <span className="text-sm">Notificaciones bloqueadas</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestPermission}
      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
    >
      <Bell className="w-4 h-4" />
      <span className="text-sm">Activar notificaciones</span>
    </button>
  );
}
