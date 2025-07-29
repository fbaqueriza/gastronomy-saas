import supabase from './supabaseClient';
import { 
  WhatsAppConfig, 
  WhatsAppMessage, 
  AIAnalysis, 
  AutomatedResponse,
  ConversationSession,
  DocumentAnalysis 
} from '../types/whatsapp';
import { Order, OrderItem } from '../types';

// Clase opcional para WhatsApp - solo se inicializa si las configuraciones están disponibles
export class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // Solo inicializar si las variables de entorno están configuradas
    this.initializeIfConfigured();
  }

  private initializeIfConfigured() {
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

    if (apiKey && phoneNumberId && businessAccountId && webhookUrl) {
      this.config = {
        provider: 'meta' as const,
        apiKey,
        phoneNumberId,
        businessAccountId,
        webhookUrl
      };
      this.isEnabled = true;
      console.log('WhatsApp Service: Configuración detectada, servicio habilitado');
    } else {
      console.log('WhatsApp Service: Configuración no encontrada, servicio deshabilitado');
      this.isEnabled = false;
    }
  }

  // Verificar si el servicio está habilitado
  public isServiceEnabled(): boolean {
    return this.isEnabled && this.config !== null;
  }

  // Enviar mensaje a WhatsApp (solo si está habilitado)
  async sendMessage(to: string, content: string, orderId?: string): Promise<WhatsAppMessage | null> {
    if (!this.isServiceEnabled()) {
      console.log('WhatsApp Service: Servicio deshabilitado, mensaje no enviado');
      return null;
    }

    try {
      const message: WhatsAppMessage = {
        id: this.generateId(),
        from: this.config!.phoneNumberId,
        to,
        type: 'sent',
        content,
        timestamp: new Date(),
        status: 'sent',
        orderId,
        isAutomated: false
      };

      // Enviar a través de la API correspondiente
      await this.sendViaAPI(message);

      // Guardar en base de datos
      await this.saveMessage(message);

      return message;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return null;
    }
  }

  // Recibir y procesar mensaje entrante (solo si está habilitado)
  async receiveMessage(messageData: any): Promise<void> {
    if (!this.isServiceEnabled()) {
      console.log('WhatsApp Service: Servicio deshabilitado, mensaje no procesado');
      return;
    }

    try {
      const message: WhatsAppMessage = {
        id: messageData.id,
        from: messageData.from,
        to: messageData.to,
        type: messageData.type,
        content: messageData.text?.body || '',
        documentUrl: messageData.image?.link || messageData.document?.link,
        timestamp: new Date(messageData.timestamp * 1000),
        status: 'delivered',
        isAutomated: false
      };

      // Guardar mensaje
      await this.saveMessage(message);

      // Analizar con IA (opcional)
      const aiAnalysis = await this.analyzeWithAI(message);
      message.aiAnalysis = aiAnalysis || undefined;

      // Procesar respuesta automática
      await this.processAutomatedResponse(message, aiAnalysis);

      // Actualizar sesión de conversación
      await this.updateConversationSession(message);

    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  // Análisis de IA del mensaje (opcional)
  async analyzeWithAI(message: WhatsAppMessage): Promise<AIAnalysis | null> {
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.log('WhatsApp Service: OpenAI no configurado, análisis de IA deshabilitado');
      return null;
    }

    try {
      const prompt = `
        Analiza el siguiente mensaje de WhatsApp para un negocio de gastronomía:
        
        Mensaje: "${message.content}"
        
        Extrae la siguiente información:
        1. Intención del cliente (order, inquiry, complaint, confirmation, other)
        2. Productos mencionados
        3. Cantidades
        4. Precios
        5. Fechas
        6. Sentimiento (positive, negative, neutral)
        7. Si requiere intervención humana
        
        Responde en formato JSON.
      `;

      // Aquí integrarías con OpenAI GPT-4
      const response = await this.callOpenAI(prompt);
      const analysis = JSON.parse(response);

      return {
        intent: analysis.intent,
        confidence: analysis.confidence || 0.8,
        entities: {
          products: analysis.products || [],
          quantities: analysis.quantities || [],
          prices: analysis.prices || [],
          dates: analysis.dates || [],
          addresses: analysis.addresses || []
        },
        sentiment: analysis.sentiment,
        extractedData: analysis.extractedData,
        suggestedResponse: analysis.suggestedResponse,
        requiresHumanIntervention: analysis.requiresHumanIntervention || false
      };

    } catch (error) {
      console.error('Error analyzing message with AI:', error);
      return null;
    }
  }

  // Procesar respuesta automática (solo si está habilitado)
  async processAutomatedResponse(message: WhatsAppMessage, analysis: AIAnalysis | null): Promise<void> {
    if (!this.isServiceEnabled()) {
      return;
    }

    try {
      // Buscar respuestas automáticas que coincidan
      const automatedResponses = await this.getAutomatedResponses();
      
      for (const response of automatedResponses) {
        if (this.matchesTrigger(message, analysis, response.trigger)) {
          const responseContent = await this.generateResponse(response, message, analysis);
          
          // Enviar respuesta automática
          await this.sendMessage(message.from, responseContent, message.orderId);
          break;
        }
      }

      // Si requiere intervención humana, notificar
      if (analysis?.requiresHumanIntervention) {
        await this.escalateToHuman(message, analysis);
      }

    } catch (error) {
      console.error('Error processing automated response:', error);
    }
  }

  // Analizar documentos (facturas, catálogos, etc.) - opcional
  async analyzeDocument(messageId: string, documentUrl: string): Promise<DocumentAnalysis | null> {
    if (!this.isServiceEnabled()) {
      return null;
    }

    try {
      // Descargar documento
      const documentBuffer = await this.downloadDocument(documentUrl);
      
      // Extraer texto con OCR
      const rawText = await this.extractTextFromDocument(documentBuffer);
      
      // Analizar con IA
      const analysis = await this.analyzeDocumentWithAI(rawText);
      
      const documentAnalysis: DocumentAnalysis = {
        id: this.generateId(),
        messageId,
        documentType: analysis.documentType,
        extractedData: analysis.extractedData,
        confidence: analysis.confidence,
        rawText,
        processedAt: new Date()
      };

      // Guardar análisis
      await this.saveDocumentAnalysis(documentAnalysis);

      return documentAnalysis;

    } catch (error) {
      console.error('Error analyzing document:', error);
      return null;
    }
  }

  // Generar insights de conversación - opcional
  async generateConversationInsights(conversationId: string): Promise<any | null> {
    if (!this.isServiceEnabled()) {
      return null;
    }

    try {
      const messages = await this.getConversationMessages(conversationId);
      const analyses = messages.map(m => m.aiAnalysis).filter(Boolean) as (AIAnalysis | null)[];

      const insights = {
        conversationId,
        customerSatisfaction: this.calculateSatisfaction(analyses),
        responseTime: this.calculateAverageResponseTime(messages),
        orderValue: this.extractOrderValue(analyses),
        commonIssues: this.extractCommonIssues(analyses),
        productPreferences: this.extractProductPreferences(analyses),
        sentimentTrend: this.analyzeSentimentTrend(analyses),
        recommendations: this.generateRecommendations(analyses),
        generatedAt: new Date()
      };

      await this.saveInsights(insights);
      return insights;

    } catch (error) {
      console.error('Error generating insights:', error);
      return null;
    }
  }

  // Métodos auxiliares
  private async sendViaAPI(message: WhatsAppMessage): Promise<void> {
    if (!this.isServiceEnabled()) return;

    // Implementar según el proveedor (Meta, Twilio, etc.)
    if (this.config?.provider === 'twilio') {
      // Implementar envío via Twilio
      console.log('Enviando mensaje via Twilio');
    } else if (this.config?.provider === 'meta') {
      // Implementar envío via Meta WhatsApp Business API
      console.log('Enviando mensaje via Meta WhatsApp Business API');
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    // Implementar llamada a OpenAI API
    // Por ahora retornamos un mock
    return JSON.stringify({
      intent: 'order',
      confidence: 0.9,
      products: ['Bife de Chorizo', 'Asado de Tira'],
      quantities: [7, 7],
      prices: [8500, 7200],
      sentiment: 'positive',
      requiresHumanIntervention: false,
      suggestedResponse: '¡Perfecto! Procesando tu pedido...'
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private async saveMessage(message: WhatsAppMessage): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert(message);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving WhatsApp message:', error);
    }
  }

  private async getAutomatedResponses(): Promise<AutomatedResponse[]> {
    try {
      const { data, error } = await supabase
        .from('automated_responses')
        .select('*')
        .eq('isActive', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting automated responses:', error);
      return [];
    }
  }

  private matchesTrigger(message: WhatsAppMessage, analysis: AIAnalysis | null, trigger: any): boolean {
    // Verificar keywords
    const hasKeywords = trigger.keywords.some((keyword: string) =>
      message.content.toLowerCase().includes(keyword.toLowerCase())
    );

    // Verificar intent
    const matchesIntent = analysis && trigger.intent === analysis.intent;

    return hasKeywords || matchesIntent;
  }

  private async generateResponse(response: AutomatedResponse, message: WhatsAppMessage, analysis: AIAnalysis | null): Promise<string> {
    if (response.response.type === 'dynamic') {
      // Generar respuesta dinámica basada en el análisis
      return this.generateDynamicResponse(analysis, response.response.variables || []);
    }
    
    return response.response.content;
  }

  private generateDynamicResponse(analysis: AIAnalysis | null, variables: string[]): string {
    // Generar respuesta personalizada basada en el análisis
    if (analysis?.intent === 'order' && analysis.extractedData?.orderItems) {
      const items = analysis.extractedData.orderItems;
      const total = items.reduce((sum, item) => sum + item.total, 0);
      
      return `¡Perfecto! Confirmamos tu pedido:\n\n${items.map(item => 
        `• ${item.productName}: ${item.quantity} ${item.unit} × $${item.price} = $${item.total}`
      ).join('\n')}\n\nTotal: $${total}\n\n¿Cuándo necesitas la entrega?`;
    }

    return 'Gracias por tu mensaje. Te responderemos pronto.';
  }

  private async escalateToHuman(message: WhatsAppMessage, analysis: AIAnalysis): Promise<void> {
    // Notificar a agente humano
    console.log('Escalating to human agent:', message.from);
  }

  private async updateConversationSession(message: WhatsAppMessage): Promise<void> {
    // Actualizar o crear sesión de conversación
    console.log('Updating conversation session');
  }

  private async downloadDocument(url: string): Promise<Buffer> {
    // Implementar descarga de documento
    return Buffer.from('');
  }

  private async extractTextFromDocument(buffer: Buffer): Promise<string> {
    // Implementar OCR
    return '';
  }

  private async analyzeDocumentWithAI(text: string): Promise<any> {
    // Implementar análisis de documento con IA
    return {
      documentType: 'invoice',
      extractedData: {},
      confidence: 0.8
    };
  }

  private calculateSatisfaction(analyses: (AIAnalysis | null)[]): number {
    const validAnalyses = analyses.filter(Boolean) as AIAnalysis[];
    const positiveCount = validAnalyses.filter(a => a.sentiment === 'positive').length;
    return validAnalyses.length > 0 ? positiveCount / validAnalyses.length : 0;
  }

  private calculateAverageResponseTime(messages: WhatsAppMessage[]): number {
    // Implementar cálculo de tiempo de respuesta promedio
    return 0;
  }

  private extractOrderValue(analyses: (AIAnalysis | null)[]): number {
    // Extraer valor total de pedidos
    return analyses.reduce((sum, analysis) => {
      return sum + (analysis?.extractedData?.totalAmount || 0);
    }, 0);
  }

  private extractCommonIssues(analyses: (AIAnalysis | null)[]): string[] {
    // Extraer problemas comunes
    return [];
  }

  private extractProductPreferences(analyses: (AIAnalysis | null)[]): string[] {
    // Extraer preferencias de productos
    const products = new Set<string>();
    analyses.forEach(analysis => {
      analysis?.entities.products?.forEach(product => products.add(product));
    });
    return Array.from(products);
  }

  private analyzeSentimentTrend(analyses: (AIAnalysis | null)[]): 'improving' | 'declining' | 'stable' {
    // Analizar tendencia de sentimiento
    return 'stable';
  }

  private generateRecommendations(analyses: (AIAnalysis | null)[]): string[] {
    // Generar recomendaciones basadas en análisis
    return [];
  }

  private async saveDocumentAnalysis(analysis: DocumentAnalysis): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_analyses')
        .insert(analysis);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving document analysis:', error);
    }
  }

  private async saveInsights(insights: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .insert(insights);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  }

  private async getConversationMessages(conversationId: string): Promise<WhatsAppMessage[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversationId', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }
}

// Instancia global del servicio (opcional)
export const whatsappService = new WhatsAppService();