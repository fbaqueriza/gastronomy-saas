// Singleton global para SSE - Evita múltiples conexiones
class SSESingleton {
  private static instance: SSESingleton;
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;
  private listeners: Set<(data: any) => void> = new Set();
  private connectionListeners: Set<() => void> = new Set();
  private errorListeners: Set<(error: any) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private instanceId: string;

  private constructor() {
    this.instanceId = `SSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔧 SSESingleton - Instancia creada: ${this.instanceId}`);
  }

  public static getInstance(): SSESingleton {
    if (!SSESingleton.instance) {
      SSESingleton.instance = new SSESingleton();
    }
    return SSESingleton.instance;
  }

  public connect(): void {
    if (this.isConnected || this.eventSource) {
      console.log(`🔄 SSESingleton - Ya conectado, saltando...`);
      return;
    }

    console.log(`🔄 SSESingleton - Conectando SSE...`);
    
    try {
      this.eventSource = new EventSource('/api/whatsapp/sse');
      
      this.eventSource.onopen = () => {
        console.log(`✅ SSESingleton - SSE conectado exitosamente`);
        this.isConnected = true;
        this.connectionListeners.forEach(listener => listener());
      };

      this.eventSource.onmessage = (event) => {
        console.log(`📨 SSESingleton - Mensaje recibido:`, event.data);
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('❌ SSESingleton - Error procesando mensaje:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error(`❌ SSESingleton - Error en SSE:`, error);
        this.isConnected = false;
        this.errorListeners.forEach(listener => listener(error));
        
        // Limpiar conexión actual
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        
        // Reconexión automática
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error(`❌ SSESingleton - Error creando conexión:`, error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    console.log(`🔄 SSESingleton - Programando reconexión en 5 segundos...`);
    this.reconnectTimeout = setTimeout(() => {
      console.log(`🔄 SSESingleton - Reconectando...`);
      this.connect();
    }, 5000);
  }

  public disconnect(): void {
    console.log(`🔌 SSESingleton - Desconectando...`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
  }

  public addMessageListener(listener: (data: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public addConnectionListener(listener: () => void): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  public addErrorListener(listener: (error: any) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getInstanceId(): string {
    return this.instanceId;
  }
}

export default SSESingleton;
