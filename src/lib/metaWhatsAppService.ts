import supabase from './supabaseClient';

interface MetaConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  openaiApiKey?: string;
}

export class MetaWhatsAppService {
  private config!: MetaConfig;
  private isEnabled: boolean = false;
  private isSimulationMode: boolean = false;
  private initialized: boolean = false;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    // Inicialización síncrona básica
    this.initializeBasic();
  }

  private initializeBasic() {
    const accessToken = process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (accessToken && phoneNumberId && businessAccountId) {
      this.config = {
        accessToken,
        phoneNumberId,
        businessAccountId,
        openaiApiKey: process.env.OPENAI_API_KEY
      };
      
      // Por defecto, usar modo simulación hasta verificar credenciales
      this.isEnabled = true;
      this.isSimulationMode = true;
      console.log('Meta WhatsApp Service: Inicializando en modo simulación');
    } else {
      console.log('Meta WhatsApp Service: Configuración no encontrada, usando modo simulación');
      this.isEnabled = true;
      this.isSimulationMode = true;
    }
  }

  private async initializeIfConfigured() {
    if (this.initialized) return;

    const accessToken = process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (accessToken && phoneNumberId && businessAccountId) {
      this.config = {
        accessToken,
        phoneNumberId,
        businessAccountId,
        openaiApiKey: process.env.OPENAI_API_KEY
      };
      
      try {
        // Verificar si las credenciales son válidas
        const response = await fetch(`${this.baseUrl}/${phoneNumberId}?access_token=${accessToken}`);
        
        if (response.ok) {
          this.isEnabled = true;
          this.isSimulationMode = false;
          this.initialized = true;
          console.log('Meta WhatsApp Service: Configuración válida, servicio habilitado en modo producción');
        } else {
          console.log('Meta WhatsApp Service: Credenciales inválidas, usando modo simulación');
          this.isEnabled = true;
          this.isSimulationMode = true;
          this.initialized = true;
        }
      } catch (error: any) {
        console.log('Meta WhatsApp Service: Error verificando credenciales, usando modo simulación');
        this.isEnabled = true;
        this.isSimulationMode = true;
        this.initialized = true;
      }
    } else {
      console.log('Meta WhatsApp Service: Configuración no encontrada, usando modo simulación');
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
      console.log('Meta WhatsApp Service: Servicio deshabilitado');
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
          from: this.config?.phoneNumberId || '123456789',
          to,
          content,
          timestamp: new Date(),
          status: 'sent',
          isAutomated: false,
          isSimulated: true
        });

        console.log('✅ [SIMULACIÓN] Mensaje enviado exitosamente:', messageId);
        
        return {
          id: messageId,
          status: 'sent',
          simulated: true
        };
      } else {
        // Modo real
        console.log('📤 [REAL] Enviando mensaje WhatsApp:', {
          to,
          content,
          from: this.config.phoneNumberId,
          timestamp: new Date().toISOString()
        });

        // Normalizar número de teléfono
        let normalizedPhone = to.replace(/[\s\-\(\)]/g, '');
        if (!normalizedPhone.startsWith('+')) {
          normalizedPhone = `+${normalizedPhone}`;
        }

        const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: normalizedPhone,
            type: 'text',
            text: {
              body: content
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ [REAL] Mensaje enviado exitosamente:', result);

        // Guardar en base de datos (temporalmente deshabilitado)
        try {
          await this.saveMessage({
            id: result.messages?.[0]?.id || `msg_${Date.now()}`,
            from: this.config.phoneNumberId,
            to: normalizedPhone,
            content,
            timestamp: new Date(),
            status: 'sent',
            isAutomated: false,
            isSimulated: false
          });
        } catch (error) {
          console.log('Error guardando mensaje (no crítico):', error);
        }

        return result;
      }
    } catch (error) {
      console.error('❌ Error sending Meta WhatsApp message:', error);
      
      // Si hay error en modo real, intentar modo simulación como fallback
      if (!this.isSimulationMode) {
        console.log('🔄 Intentando modo simulación como fallback...');
        this.isSimulationMode = true;
        return await this.sendMessage(to, content);
      }
      
      return null;
    }
  }

  // Enviar mensaje con plantilla
  async sendTemplateMessage(to: string, templateName: string, language: string = 'es', components?: any[]): Promise<any> {
    await this.initializeIfConfigured();

    if (!this.isServiceEnabled()) {
      console.log('Meta WhatsApp Service: Servicio deshabilitado');
      return null;
    }

    try {
      if (this.isSimulationMode) {
        console.log('📤 [SIMULACIÓN] Enviando mensaje con plantilla:', {
          to,
          templateName,
          language
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const messageId = `sim_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await this.saveMessage({
          id: messageId,
          from: this.config?.phoneNumberId || '123456789',
          to,
          content: `[TEMPLATE: ${templateName}]`,
          timestamp: new Date(),
          status: 'sent',
          isAutomated: true,
          isSimulated: true
        });

        return {
          id: messageId,
          status: 'sent',
          simulated: true
        };
      } else {
        let normalizedPhone = to.replace(/[\s\-\(\)]/g, '');
        if (!normalizedPhone.startsWith('+')) {
          normalizedPhone = `+${normalizedPhone}`;
        }

        const messageData: any = {
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            }
          }
        };

        if (components) {
          messageData.template.components = components;
        }

        const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ [REAL] Mensaje con plantilla enviado exitosamente:', result);

        await this.saveMessage({
          id: result.messages?.[0]?.id || `template_${Date.now()}`,
          from: this.config.phoneNumberId,
          to: normalizedPhone,
          content: `[TEMPLATE: ${templateName}]`,
          timestamp: new Date(),
          status: 'sent',
          isAutomated: true,
          isSimulated: false
        });

        return result;
      }
    } catch (error) {
      console.error('❌ Error sending template message:', error);
      
      if (!this.isSimulationMode) {
        console.log('🔄 Intentando modo simulación como fallback...');
        this.isSimulationMode = true;
        return await this.sendTemplateMessage(to, templateName, language, components);
      }
      
      return null;
    }
  }

  // Procesar mensaje entrante con IA automática
  async processIncomingMessage(messageData: any): Promise<void> {
    console.log('📥 processIncomingMessage - Iniciando procesamiento:', messageData);
    
    await this.initializeIfConfigured();

    if (!this.isServiceEnabled()) {
      console.log('❌ processIncomingMessage - Servicio deshabilitado');
      return;
    }

    try {
      console.log('💾 processIncomingMessage - Guardando mensaje...');
      
      // Guardar mensaje
      await this.saveMessage({
        id: messageData.id || `sim_${Date.now()}`,
        from: messageData.from,
        to: messageData.to,
        content: messageData.text?.body || messageData.message,
        timestamp: new Date(messageData.timestamp || Date.now()),
        status: 'delivered',
        isAutomated: false,
        isSimulated: this.isSimulationMode
      });

      console.log('🤖 processIncomingMessage - Análisis de IA desactivado');
      
      // Comentado: Respuesta automática desactivada
      // const analysis = await this.analyzeWithAI(messageData.text?.body || messageData.message);
      // const autoResponse = await this.generateAutoResponse(analysis, messageData.text?.body || messageData.message);
      // if (autoResponse) {
      //   console.log('📤 processIncomingMessage - Enviando respuesta automática:', autoResponse);
      //   await this.sendMessage(messageData.from, autoResponse);
      // }

      console.log('✅ processIncomingMessage - Mensaje procesado correctamente');

    } catch (error) {
      console.error('💥 Error processing incoming message:', error);
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
    const entities = {
      products: [] as string[],
      quantities: [] as string[],
      prices: [] as string[]
    };

    const words = message.toLowerCase().split(' ');
    
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

  // Guardar mensaje en base de datos
  private async saveMessage(message: any): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('Supabase no configurado, saltando guardado de mensaje');
        return;
      }

      console.log('💾 saveMessage - Guardando mensaje:', {
        id: message.id,
        from: message.from,
        to: message.to,
        content: message.content || message.text?.body
      });

      // Usar solo las columnas más básicas y generar UUID válido
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const messageData = {
        id: generateUUID(), // Siempre generar UUID para el id
        content: message.content || message.text?.body || '',
        timestamp: message.timestamp || new Date().toISOString(),
        message_sid: message.id || generateUUID(), // Usar el ID original de Meta como message_sid
        contact_id: message.from || 'unknown',
        message_type: 'text',
        user_id: 'default_user'
      };

      const { error } = await supabase
        .from('whatsapp_messages')
        .insert(messageData);
      
      if (error) {
        console.log('❌ Error saving WhatsApp message (no crítico):', error);
      } else {
        console.log('✅ saveMessage - Mensaje guardado correctamente');
      }
    } catch (error) {
      console.log('💥 Error saving WhatsApp message (no crítico):', error);
    }
  }

  // Obtener estadísticas
  async getStatistics(): Promise<any> {
    await this.initializeIfConfigured();

    if (!this.isServiceEnabled()) return null;

    try {
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

  // Verificar estado del servicio
  async getServiceStatus(): Promise<any> {
    await this.initializeIfConfigured();

    return {
      enabled: this.isServiceEnabled(),
      simulationMode: this.isSimulationModeEnabled(),
      configured: !!(this.config?.accessToken && this.config?.phoneNumberId),
      phoneNumberId: this.config?.phoneNumberId,
      businessAccountId: this.config?.businessAccountId
    };
  }
}

// Instancia global
export const metaWhatsAppService = new MetaWhatsAppService(); 