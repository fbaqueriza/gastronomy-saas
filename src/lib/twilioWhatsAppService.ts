import twilio from 'twilio';
import supabase from './supabaseClient';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  openaiApiKey?: string;
}

export class TwilioWhatsAppService {
  private client!: twilio.Twilio;
  private config!: TwilioConfig;
  private isEnabled: boolean = false;
  private isSimulationMode: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Inicialización síncrona básica
    this.initializeBasic();
  }

  private initializeBasic() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      this.config = {
        accountSid,
        authToken,
        phoneNumber,
        openaiApiKey: process.env.OPENAI_API_KEY
      };
      
      // Por defecto, usar modo simulación hasta verificar credenciales
      this.isEnabled = true;
      this.isSimulationMode = true;
      console.log('Twilio WhatsApp Service: Inicializando en modo simulación');
    } else {
      console.log('Twilio WhatsApp Service: Configuración no encontrada, usando modo simulación');
      this.isEnabled = true;
      this.isSimulationMode = true;
    }
  }

  private async initializeIfConfigured() {
    if (this.initialized) return;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      this.config = {
        accountSid,
        authToken,
        phoneNumber,
        openaiApiKey: process.env.OPENAI_API_KEY
      };
      
      try {
        this.client = twilio(accountSid, authToken);
        
        // Verificar si las credenciales son válidas
        await this.client.api.accounts(accountSid).fetch();
        
        this.isEnabled = true;
        this.isSimulationMode = false;
        this.initialized = true;
        console.log('Twilio WhatsApp Service: Configuración válida, servicio habilitado');
      } catch (error: any) {
        console.log('Twilio WhatsApp Service: Credenciales inválidas, usando modo simulación');
        this.isEnabled = true;
        this.isSimulationMode = true;
        this.initialized = true;
      }
    } else {
      console.log('Twilio WhatsApp Service: Configuración no encontrada, usando modo simulación');
      this.isEnabled = true;
      this.isSimulationMode = true;
      this.initialized = true;
    }
  }

  public isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  public isSimulationModeEnabled(): boolean {
    return this.isSimulationMode;
  }

  // Enviar mensaje simple
  async sendMessage(to: string, content: string): Promise<any> {
    // Asegurar que el servicio esté inicializado
    await this.initializeIfConfigured();

    if (!this.isServiceEnabled()) {
      console.log('Twilio WhatsApp Service: Servicio deshabilitado');
      return null;
    }

    try {
      if (this.isSimulationMode) {
        // Modo simulación
        console.log('📤 [SIMULACIÓN] Enviando mensaje WhatsApp:', {
          to,
          content,
          timestamp: new Date().toISOString()
        });

        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1000));

        const messageId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Guardar en base de datos
        await this.saveMessage({
          id: messageId,
          from: this.config?.phoneNumber || '+1234567890',
          to,
          content,
          timestamp: new Date(),
          status: 'sent',
          isAutomated: false,
          isSimulated: true
        });

        console.log('✅ [SIMULACIÓN] Mensaje enviado exitosamente:', messageId);
        
        return {
          sid: messageId,
          status: 'sent',
          simulated: true
        };
      } else {
        // Modo real
        const message = await this.client.messages
          .create({
            body: content,
            from: `whatsapp:${this.config.phoneNumber}`,
            to: `whatsapp:${to}`,
            statusCallback: undefined
          });

        // Guardar en base de datos
        await this.saveMessage({
          id: message.sid,
          from: this.config.phoneNumber,
          to,
          content,
          timestamp: new Date(),
          status: 'sent',
          isAutomated: false,
          isSimulated: false
        });

        return message;
      }
    } catch (error) {
      console.error('Error sending Twilio WhatsApp message:', error);
      return null;
    }
  }

  // Procesar mensaje entrante con IA automática
  async processIncomingMessage(messageData: any): Promise<void> {
    // Asegurar que el servicio esté inicializado
    await this.initializeIfConfigured();

    if (!this.isServiceEnabled()) return;

    try {
      // Guardar mensaje
      await this.saveMessage({
        id: messageData.sid || `sim_${Date.now()}`,
        from: messageData.from,
        to: messageData.to,
        content: messageData.body,
        timestamp: new Date(messageData.dateCreated || Date.now()),
        status: 'delivered',
        isAutomated: false,
        isSimulated: this.isSimulationMode
      });

      // Analizar con IA automáticamente
      const analysis = await this.analyzeWithAI(messageData.body);
      
      // Generar respuesta automática
      const autoResponse = await this.generateAutoResponse(analysis, messageData.body);
      
      if (autoResponse) {
        await this.sendMessage(messageData.from, autoResponse);
      }

    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  // Análisis automático con IA
  private async analyzeWithAI(message: string): Promise<any> {
    if (!this.config.openaiApiKey) {
      return {
        intent: 'general',
        sentiment: 'neutral',
        requiresHuman: false
      };
    }

    try {
      // Aquí integrarías con OpenAI para análisis
      // Por ahora retornamos análisis básico
      const analysis = {
        intent: this.detectIntent(message),
        sentiment: this.detectSentiment(message),
        entities: this.extractEntities(message),
        requiresHuman: this.requiresHumanIntervention(message)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      return null;
    }
  }

  // Generar respuesta automática
  private async generateAutoResponse(analysis: any, originalMessage: string): Promise<string | null> {
    if (analysis?.requiresHuman) {
      return 'Gracias por tu mensaje. Un agente humano te responderá pronto.';
    }

    // Respuestas automáticas basadas en intención
    switch (analysis?.intent) {
      case 'order':
        return '¡Perfecto! Procesando tu pedido. ¿Cuándo necesitas la entrega?';
      case 'inquiry':
        return 'Te ayudo con tu consulta. ¿Qué información necesitas?';
      case 'complaint':
        return 'Lamento el inconveniente. Un agente te contactará para resolverlo.';
      default:
        return 'Gracias por tu mensaje. ¿En qué puedo ayudarte?';
    }
  }

  // Detectar intención básica
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') || lowerMessage.includes('comprar')) {
      return 'order';
    }
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuánto')) {
      return 'inquiry';
    }
    if (lowerMessage.includes('problema') || lowerMessage.includes('error') || lowerMessage.includes('queja')) {
      return 'complaint';
    }
    
    return 'general';
  }

  // Detectar sentimiento básico
  private detectSentiment(message: string): string {
    const positiveWords = ['gracias', 'excelente', 'perfecto', 'bueno', 'genial'];
    const negativeWords = ['malo', 'terrible', 'pésimo', 'enojado', 'molesto'];
    
    const lowerMessage = message.toLowerCase();
    
    if (positiveWords.some(word => lowerMessage.includes(word))) {
      return 'positive';
    }
    if (negativeWords.some(word => lowerMessage.includes(word))) {
      return 'negative';
    }
    
    return 'neutral';
  }

  // Extraer entidades básicas
  private extractEntities(message: string): any {
    // Extraer productos, cantidades, precios
    const entities = {
      products: [] as string[],
      quantities: [] as string[],
      prices: [] as string[]
    };

    // Implementación básica de extracción
    const words = message.toLowerCase().split(' ');
    
    // Detectar productos comunes
    const productKeywords = ['naranja', 'pomelo', 'mandarina', 'lima', 'carne', 'pollo'];
    words.forEach(word => {
      if (productKeywords.includes(word)) {
        entities.products.push(word);
      }
    });

    return entities;
  }

  // Determinar si requiere intervención humana
  private requiresHumanIntervention(message: string): boolean {
    const complexKeywords = ['problema', 'queja', 'error', 'urgente', 'importante'];
    const lowerMessage = message.toLowerCase();
    
    return complexKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Guardar mensaje en base de datos (opcional)
  private async saveMessage(message: any): Promise<void> {
    try {
      // Solo intentar guardar si Supabase está configurado correctamente
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('Supabase no configurado, saltando guardado de mensaje');
        return;
      }

      const { error } = await supabase
        .from('whatsapp_messages')
        .insert(message);
      
      if (error) {
        console.log('Error saving WhatsApp message (no crítico):', error);
        // No lanzar error para no interrumpir el flujo
      }
    } catch (error) {
      console.log('Error saving WhatsApp message (no crítico):', error);
      // No lanzar error para no interrumpir el flujo
    }
  }

  // Obtener estadísticas (optimizado)
  async getStatistics(): Promise<any> {
    // Asegurar que el servicio esté inicializado
    await this.initializeIfConfigured();

    if (!this.isServiceEnabled()) return null;

    try {
      // Solo intentar obtener estadísticas si Supabase está configurado correctamente
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('Supabase no configurado, retornando estadísticas básicas');
        return {
          totalMessages: 0,
          automatedResponses: 0,
          humanInterventions: 0,
          simulatedMessages: 0,
          averageResponseTime: 0,
          mode: this.isSimulationModeEnabled() ? 'simulation' : 'production'
        };
      }

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.log('Error getting statistics (no crítico):', error);
        return {
          totalMessages: 0,
          automatedResponses: 0,
          humanInterventions: 0,
          simulatedMessages: 0,
          averageResponseTime: 0,
          mode: this.isSimulationModeEnabled() ? 'simulation' : 'production'
        };
      }

      const stats = {
        totalMessages: data?.length || 0,
        automatedResponses: data?.filter(m => m.isAutomated).length || 0,
        humanInterventions: data?.filter(m => !m.isAutomated).length || 0,
        simulatedMessages: data?.filter(m => m.isSimulated).length || 0,
        averageResponseTime: this.calculateAverageResponseTime(data || []),
        mode: this.isSimulationModeEnabled() ? 'simulation' : 'production'
      };

      return stats;
    } catch (error) {
      console.log('Error getting statistics (no crítico):', error);
      return {
        totalMessages: 0,
        automatedResponses: 0,
        humanInterventions: 0,
        simulatedMessages: 0,
        averageResponseTime: 0,
        mode: this.isSimulationModeEnabled() ? 'simulation' : 'production'
      };
    }
  }

  private calculateAverageResponseTime(messages: any[]): number {
    // Implementar cálculo de tiempo de respuesta promedio
    return 0;
  }
}

// Instancia global
export const twilioWhatsAppService = new TwilioWhatsAppService(); 