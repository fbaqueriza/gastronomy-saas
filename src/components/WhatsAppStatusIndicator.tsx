'use client';

import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

interface WhatsAppStatusIndicatorProps {
  className?: string;
}

export default function WhatsAppStatusIndicator({ className = '' }: WhatsAppStatusIndicatorProps) {
  const { connectionStatus, isConnected } = useChat();

  const getStatusColor = () => {
    if (isConnected && connectionStatus === 'connected') {
      return 'text-green-500';
    } else if (connectionStatus === 'connecting') {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };

  const getStatusIcon = () => {
    if (isConnected && connectionStatus === 'connected') {
      return <Wifi className="h-4 w-4" />;
    } else if (connectionStatus === 'connecting') {
      return <AlertCircle className="h-4 w-4" />;
    } else {
      return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (isConnected && connectionStatus === 'connected') {
      return 'Conectado';
    } else if (connectionStatus === 'connecting') {
      return 'Conectando...';
    } else {
      return 'Desconectado';
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
    </div>
  );
}
