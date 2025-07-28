// WhatsApp Integration Types
import { OrderItem } from './index';

export interface WhatsAppConfig {
  provider: 'meta' | 'twilio' | '360dialog';
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  content: string;
  mediaUrl?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  orderId?: string;
  providerId?: string;
  isAutomated: boolean;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  intent: 'order' | 'inquiry' | 'complaint' | 'confirmation' | 'other';
  confidence: number;
  entities: {
    products?: string[];
    quantities?: number[];
    prices?: number[];
    dates?: Date[];
    addresses?: string[];
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  extractedData?: {
    orderItems?: OrderItem[];
    totalAmount?: number;
    deliveryDate?: Date;
    specialInstructions?: string;
  };
  suggestedResponse?: string;
  requiresHumanIntervention: boolean;
}

export interface AutomatedResponse {
  id: string;
  name: string;
  trigger: {
    keywords: string[];
    intent: string;
    conditions: Record<string, any>;
  };
  response: {
    type: 'text' | 'template' | 'dynamic';
    content: string;
    variables?: string[];
  };
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: 'marketing' | 'utility' | 'authentication';
  components: {
    type: 'header' | 'body' | 'footer' | 'button';
    text?: string;
    format?: string;
    example?: string[];
  }[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface ConversationSession {
  id: string;
  customerPhone: string;
  providerId: string;
  orderId?: string;
  status: 'active' | 'resolved' | 'escalated';
  messages: WhatsAppMessage[];
  aiAnalysis: AIAnalysis[];
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface DocumentAnalysis {
  id: string;
  messageId: string;
  documentType: 'invoice' | 'receipt' | 'catalog' | 'other';
  extractedData: {
    totalAmount?: number;
    currency?: string;
    invoiceNumber?: string;
    dueDate?: Date;
    items?: OrderItem[];
    supplierInfo?: {
      name: string;
      taxId: string;
      address: string;
    };
  };
  confidence: number;
  rawText: string;
  processedAt: Date;
}

export interface AIInsights {
  conversationId: string;
  customerSatisfaction: number;
  responseTime: number;
  orderValue: number;
  commonIssues: string[];
  productPreferences: string[];
  sentimentTrend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
  generatedAt: Date;
} 