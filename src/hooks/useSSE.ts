import { useEffect, useRef, useCallback } from 'react';

// Hook personalizado para SSE con debugging profesional
export const useSSE = (
  onMessage: (data: any) => void,
  onOpen?: () => void,
  onError?: (error: any) => void
) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isInitializedRef = useRef(false);
  const hookInstanceRef = useRef(`useSSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Debugging profesional: Identificar instancia del hook
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 useSSE - Instancia: ${hookInstanceRef.current} - Inicializando...`);
  }
  
  // Usar refs para las funciones callback para evitar re-inicializaciones
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);
  
  // Actualizar refs cuando cambian las funciones
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const connect = useCallback(() => {
    if (isInitializedRef.current || eventSourceRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 useSSE - Instancia: ${hookInstanceRef.current} - Ya conectado, saltando...`);
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 useSSE - Instancia: ${hookInstanceRef.current} - Conectando SSE...`);
    }
    isInitializedRef.current = true;

    const eventSource = new EventSource('/api/whatsapp/sse');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ useSSE - Instancia: ${hookInstanceRef.current} - SSE conectado exitosamente`);
      }
      onOpenRef.current?.();
    };

    eventSource.onmessage = (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📨 useSSE - Mensaje recibido:', event.data);
      }
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ useSSE - Error procesando mensaje:', error);
        }
      }
    };

    eventSource.onerror = (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ useSSE - Error en SSE:', error);
      }
      onErrorRef.current?.(error);
      
      // Limpiar referencia
      eventSourceRef.current = null;
      isInitializedRef.current = false;
      
      // Reconexión automática después de 5 segundos
      setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 useSSE - Reconectando...');
        }
        connect();
      }, 5000);
    };
  }, []); // Sin dependencias para evitar re-inicializaciones

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 useSSE - Desconectando...');
      }
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isInitializedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 useSSE - Inicializando en useEffect...');
    }
    connect();

    // Cleanup solo al desmontar el componente
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 useSSE - Cleanup al desmontar...');
      }
      disconnect();
    };
  }, []); // Solo una vez al montar

  return {
    isConnected: eventSourceRef.current !== null,
    disconnect
  };
};
