'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface WhatsAppStatusIndicatorProps {
  className?: string;
}

export default function WhatsAppStatusIndicator({ className = '' }: WhatsAppStatusIndicatorProps) {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp/status');
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.service.enabled ? 'connected' : 'disconnected');
          setIsSimulationMode(data.service.simulationMode || false);
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        setStatus('disconnected');
      }
    };

    // Verificar estado inicial
    checkStatus();

    // Verificar estado cada 30 segundos
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4" />;
      case 'connecting':
        return <AlertCircle className="h-4 w-4" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return isSimulationMode ? 'Simulación' : 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </div>
      <span className={`text-sm ${getStatusColor()}`}>
        WhatsApp {getStatusText()}
      </span>
      {isSimulationMode && status === 'connected' && (
        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
          🔧 Simulación
        </span>
      )}
    </div>
  );
}
