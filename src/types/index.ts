// Use Firebase Auth User type directly in the app, no need to redefine here.

// Provider types
export interface Provider {
  id: string;
  user_id: string;
  name: string;
  email: string;
  contactName?: string;
  phone: string;
  address?: string;
  categories: string[];
  tags: string[];
  notes?: string;
  cbu?: string;
  alias?: string;
  cuitCuil?: string;
  razonSocial?: string;
  catalogs: Catalog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Catalog {
  id: string;
  providerId: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  expiresAt?: Date;
}

// Stock types
export interface StockItem {
  id: string;
  user_id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  restockFrequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  associatedProviders: string[]; // Provider IDs
  preferredProvider?: string; // Provider ID
  lastOrdered?: Date;
  nextOrder?: Date;
  createdAt: Date;
  updatedAt: Date;
  consumptionHistory?: number[];
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  orderNumber: string;
  providerId: string;
  items: OrderItem[];
  status: 'pending' | 'factura_recibida' | 'pagado' | 'enviado' | 'finalizado' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  currency: string;
  orderDate: Date;
  dueDate?: Date;
  invoiceNumber?: string;
  bankInfo?: {
    iban?: string;
    swift?: string;
    accountNumber?: string;
    bankName?: string;
  };
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  providerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: Date;
  invoiceNumber?: string;
  bankInfo?: {
    iban?: string;
    swift?: string;
    accountNumber?: string;
    bankName?: string;
  };
  confirmationUrl?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp message types
export interface WhatsAppMessage {
  id: string;
  orderId: string;
  providerId: string;
  type: 'order' | 'confirmation';
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

// PDF parsing types
export interface ParsedReceipt {
  totalAmount: number;
  currency: string;
  dueDate: Date;
  invoiceNumber: string;
  bankInfo: {
    iban?: string;
    swift?: string;
    accountNumber?: string;
    bankName?: string;
  };
  confidence: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface ProviderForm {
  name: string;
  email: string;
  phone: string;
  address?: string;
  categories: string[];
  tags: string[];
  notes?: string;
  cbu?: string;
  alias?: string;
  cuitCuil?: string;
  razonSocial?: string;
}

export interface StockItemForm {
  productName: string;
  quantity: number;
  unit: string;
  restockFrequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  minimumQuantity: number;
  currentStock: number;
  associatedProviders: string[];
  preferredProvider?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Table types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: number;
  render?: (value: any, row: T) => any;
}

export interface TableState {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters: Record<string, any>;
}

// Export types
export interface ExportOptions {
  format: 'xlsx' | 'csv';
  selectedIds?: string[];
  filters?: Record<string, any>;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
} 
