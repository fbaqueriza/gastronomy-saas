'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from '../../components/Navigation';
import WhatsAppChat from '../../components/WhatsAppChat';
import SuggestedOrders from '../../components/SuggestedOrders';
import CreateOrderModal from '../../components/CreateOrderModal';
import { Order, OrderItem, Provider, StockItem } from '../../types';
import {
  Plus,
  ShoppingCart,
  Send,
  MessageSquare,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      providerId: '2',
      items: [
        {
          productName: 'Bife de Chorizo',
          quantity: 7,
          unit: 'kg',
          price: 8500,
          total: 59500,
        },
        {
          productName: 'Asado de Tira',
          quantity: 7,
          unit: 'kg',
          price: 7200,
          total: 50400,
        },
      ],
      status: 'sent',
      totalAmount: 109900,
      currency: 'ARS',
      orderDate: new Date('2024-01-20'),
      dueDate: new Date('2024-01-25'),
      invoiceNumber: 'INV-2024-001',
      bankInfo: {
        iban: 'AR1234567890123456789012',
        swift: 'BANCOAR',
        bankName: 'Banco de la Nación Argentina',
      },
      receiptUrl: '',
      notes: 'Entregar antes de las 10:00 hs',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      providerId: '5',
      items: [
        {
          productName: 'Leche Entera',
          quantity: 12,
          unit: 'L',
          price: 450,
          total: 5400,
        },
        {
          productName: 'Queso Cremoso',
          quantity: 4,
          unit: 'kg',
          price: 3200,
          total: 12800,
        },
      ],
      status: 'pending',
      totalAmount: 18200,
      currency: 'ARS',
      orderDate: new Date('2024-01-21'),
      dueDate: new Date('2024-01-26'),
      invoiceNumber: '',
      bankInfo: {},
      receiptUrl: '',
      notes: 'Queso fresco por favor',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      providerId: '4',
      items: [
        {
          productName: 'Tomates Perita',
          quantity: 6,
          unit: 'kg',
          price: 1200,
          total: 7200,
        },
        {
          productName: 'Lechuga Mantecosa',
          quantity: 4,
          unit: 'kg',
          price: 800,
          total: 3200,
        },
      ],
      status: 'confirmed',
      totalAmount: 10400,
      currency: 'ARS',
      orderDate: new Date('2024-01-22'),
      dueDate: new Date('2024-01-27'),
      invoiceNumber: 'INV-2024-003',
      bankInfo: {
        iban: 'AR9876543210987654321098',
        swift: 'BANCOAR',
        bankName: 'Banco Santander Argentina',
      },
      receiptUrl: '',
      notes: 'Verduras orgánicas únicamente',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Mock providers and stock data for suggested orders
  const [providers] = useState<Provider[]>([
    {
      id: '1',
      name: 'Distribuidora Gastronómica S.A.',
      email: 'pedidos@distgastronomica.com',
      phone: '+54 11 4567-8901',
      address: 'Av. Corrientes 1234, CABA, Buenos Aires',
      categories: ['Proveeduría General', 'Lácteos', 'Frescos'],
      tags: ['confiable', 'entrega rápida'],
      notes: 'Proveedor principal con amplio catálogo y entrega en 24h',
      cbu: 'ES9121000418450200051332',
      alias: 'DISTGASTRO',
      cuitCuil: '30-12345678-9',
      razonSocial: 'Distribuidora Gastronómica S.A.',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Carnes Premium del Sur',
      email: 'ventas@carnespremium.com',
      phone: '+54 11 3456-7890',
      address: 'Ruta 2 Km 45, La Plata, Buenos Aires',
      categories: ['Carnes', 'Proteínas', 'Premium'],
      tags: ['premium', 'calidad superior'],
      notes: 'Especialistas en carnes premium y cortes especiales',
      cbu: 'ES9121000418450200051333',
      alias: 'CARNESUR',
      cuitCuil: '30-98765432-1',
      razonSocial: 'Carnes Premium del Sur S.R.L.',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Pescados Frescos Mar del Plata',
      email: 'pedidos@pescadosfrescos.com',
      phone: '+54 223 456-7890',
      address: 'Puerto de Mar del Plata, Buenos Aires',
      categories: ['Pescados', 'Mariscos', 'Frescos'],
      tags: ['fresco', 'directo del mar'],
      notes: 'Pescados y mariscos frescos directo del puerto',
      cbu: 'ES9121000418450200051334',
      alias: 'PESCADOSMP',
      cuitCuil: '30-45678912-3',
      razonSocial: 'Pescados Frescos MDP S.A.',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Verduras Orgánicas La Huerta',
      email: 'info@lahuertaorganica.com',
      phone: '+54 11 2345-6789',
      address: 'Ruta 8 Km 32, San Vicente, Buenos Aires',
      categories: ['Verduras', 'Orgánicas', 'Frescos'],
      tags: ['orgánico', 'sustentable'],
      notes: 'Verduras orgánicas de producción propia',
      cbu: 'ES9121000418450200051335',
      alias: 'HUERTAORG',
      cuitCuil: '30-78912345-6',
      razonSocial: 'La Huerta Orgánica S.R.L.',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      name: 'Lácteos Artesanales El Tambo',
      email: 'ventas@eltambo.com',
      phone: '+54 11 1234-5678',
      address: 'Ruta 6 Km 78, Cañuelas, Buenos Aires',
      categories: ['Lácteos', 'Artesanal', 'Quesos'],
      tags: ['artesanal', 'tradicional'],
      notes: 'Lácteos artesanales y quesos de autor',
      cbu: 'ES9121000418450200051336',
      alias: 'ELTAMBO',
      cuitCuil: '30-32165498-7',
      razonSocial: 'El Tambo Artesanal S.A.',
      catalogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [stockItems] = useState<StockItem[]>([
    // Carnes
    {
      id: '1',
      productName: 'Bife de Chorizo',
      category: 'Carnes',
      quantity: 50,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 15,
      currentStock: 8,
      associatedProviders: ['2'],
      preferredProvider: '2',
      lastOrdered: new Date('2024-01-18'),
      nextOrder: new Date('2024-01-25'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      productName: 'Asado de Tira',
      category: 'Carnes',
      quantity: 40,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 12,
      currentStock: 5,
      associatedProviders: ['2'],
      preferredProvider: '2',
      lastOrdered: new Date('2024-01-19'),
      nextOrder: new Date('2024-01-26'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      productName: 'Pollo Entero',
      category: 'Carnes',
      quantity: 30,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 10,
      currentStock: 15,
      associatedProviders: ['1', '2'],
      preferredProvider: '1',
      lastOrdered: new Date('2024-01-20'),
      nextOrder: new Date('2024-01-27'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Pescados
    {
      id: '4',
      productName: 'Merluza Fresca',
      category: 'Pescados',
      quantity: 25,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 8,
      currentStock: 3,
      associatedProviders: ['3'],
      preferredProvider: '3',
      lastOrdered: new Date('2024-01-21'),
      nextOrder: new Date('2024-01-28'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      productName: 'Salmón Rosado',
      category: 'Pescados',
      quantity: 20,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 6,
      currentStock: 12,
      associatedProviders: ['3'],
      preferredProvider: '3',
      lastOrdered: new Date('2024-01-22'),
      nextOrder: new Date('2024-01-29'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Verduras
    {
      id: '6',
      productName: 'Tomates Perita',
      category: 'Verduras',
      quantity: 30,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 10,
      currentStock: 4,
      associatedProviders: ['1', '4'],
      preferredProvider: '4',
      lastOrdered: new Date('2024-01-23'),
      nextOrder: new Date('2024-01-30'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '7',
      productName: 'Lechuga Mantecosa',
      category: 'Verduras',
      quantity: 20,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 6,
      currentStock: 2,
      associatedProviders: ['1', '4'],
      preferredProvider: '4',
      lastOrdered: new Date('2024-01-24'),
      nextOrder: new Date('2024-01-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '8',
      productName: 'Cebolla Blanca',
      category: 'Verduras',
      quantity: 25,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 8,
      currentStock: 18,
      associatedProviders: ['1', '4'],
      preferredProvider: '1',
      lastOrdered: new Date('2024-01-25'),
      nextOrder: new Date('2024-02-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Lácteos
    {
      id: '9',
      productName: 'Leche Entera',
      category: 'Lácteos',
      quantity: 60,
      unit: 'L',
      restockFrequency: 'daily',
      minimumQuantity: 20,
      currentStock: 8,
      associatedProviders: ['1', '5'],
      preferredProvider: '5',
      lastOrdered: new Date('2024-01-26'),
      nextOrder: new Date('2024-01-27'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '10',
      productName: 'Queso Cremoso',
      category: 'Lácteos',
      quantity: 15,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 5,
      currentStock: 1,
      associatedProviders: ['1', '5'],
      preferredProvider: '5',
      lastOrdered: new Date('2024-01-27'),
      nextOrder: new Date('2024-02-03'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '11',
      productName: 'Manteca',
      category: 'Lácteos',
      quantity: 10,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 3,
      currentStock: 6,
      associatedProviders: ['1', '5'],
      preferredProvider: '5',
      lastOrdered: new Date('2024-01-28'),
      nextOrder: new Date('2024-02-04'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Proveeduría General
    {
      id: '12',
      productName: 'Harina 0000',
      category: 'Proveeduría General',
      quantity: 50,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 15,
      currentStock: 22,
      associatedProviders: ['1'],
      preferredProvider: '1',
      lastOrdered: new Date('2024-01-29'),
      nextOrder: new Date('2024-02-05'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '13',
      productName: 'Aceite de Oliva',
      category: 'Proveeduría General',
      quantity: 20,
      unit: 'L',
      restockFrequency: 'weekly',
      minimumQuantity: 6,
      currentStock: 3,
      associatedProviders: ['1'],
      preferredProvider: '1',
      lastOrdered: new Date('2024-01-30'),
      nextOrder: new Date('2024-02-06'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '14',
      productName: 'Sal Fina',
      category: 'Proveeduría General',
      quantity: 10,
      unit: 'kg',
      restockFrequency: 'monthly',
      minimumQuantity: 2,
      currentStock: 8,
      associatedProviders: ['1'],
      preferredProvider: '1',
      lastOrdered: new Date('2024-01-15'),
      nextOrder: new Date('2024-02-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState<any>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || 'Unknown Provider';
  };

  const getProviderPhone = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.phone || '';
  };

  const handleSendOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      // Simulate WhatsApp API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update order status
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: 'sent' as const, updatedAt: new Date() }
            : order,
        ),
      );

      console.log('Sending order via WhatsApp:', orderId);
    } catch (error) {
      console.error('Failed to send order:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUploadReceipt = useCallback((orderId: string, file: File) => {
    const receiptUrl = URL.createObjectURL(file);

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, receiptUrl, updatedAt: new Date() }
          : order,
      ),
    );
  }, []);

  const handleExtractData = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const extractedData = {
        totalAmount: 161,
        currency: 'EUR',
        dueDate: new Date('2024-01-25'),
        invoiceNumber: 'INV-2024-001',
        bankInfo: {
          iban: 'ES9121000418450200051332',
          swift: 'CAIXESBBXXX',
          bankName: 'CaixaBank',
        },
      };

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
              ...order,
              ...extractedData,
              status: 'confirmed' as const,
              updatedAt: new Date(),
            }
            : order,
        ),
      );
    } catch (error) {
      console.error('Failed to extract data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsWhatsAppOpen(true);
  };

  const handleCreateOrder = (orderData: {
    providerId: string;
    items: OrderItem[];
    notes: string;
  }) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      providerId: orderData.providerId,
      items: orderData.items,
      status: 'pending',
      totalAmount: orderData.items.reduce((sum, item) => sum + item.total, 0),
      currency: 'EUR',
      orderDate: new Date(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      invoiceNumber: '',
      bankInfo: {},
      receiptUrl: '',
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOrders((prev) => [...prev, newOrder]);
    setIsCreateModalOpen(false);
    setSuggestedOrder(null);
  };

  const handleSuggestedOrderCreate = (suggestedOrder: any) => {
    setSuggestedOrder(suggestedOrder);
    setIsCreateModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {'Orders'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage orders and communicate with providers via WhatsApp
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                {'orders.newOrder'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-0">
          {/* Suggested Orders */}
          <div className="lg:col-span-1">
            <SuggestedOrders
              stockItems={stockItems}
              providers={providers}
              onCreateOrder={handleSuggestedOrderCreate}
            />
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Current Orders ({orders.length})
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0">
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </p>
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                              >
                                {t(`orders.${order.status}`)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>{getProviderName(order.providerId)}</span>
                              <span className="mx-2">•</span>
                              <span>{order.items.length} items</span>
                              <span className="mx-2">•</span>
                              <span>
                                {order.totalAmount} {order.currency}
                              </span>
                              <span className="mx-2">•</span>
                              <span>
                                {new Date(order.orderDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </button>

                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleSendOrder(order.id)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </button>
                          )}

                          {order.status === 'sent' && !order.receiptUrl && (
                            <label className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                              <Upload className="h-4 w-4 mr-1" />
                              Receipt
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadReceipt(order.id, file);
                                }}
                                className="hidden"
                              />
                            </label>
                          )}

                          {order.receiptUrl && !order.invoiceNumber && (
                            <button
                              onClick={() => handleExtractData(order.id)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Extract
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-2">Items:</div>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.productName} - {item.quantity} {item.unit}
                              </span>
                              <span>
                                {item.total} {order.currency}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-gray-400">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Extracted Data Preview */}
                      {order.invoiceNumber && (
                        <div className="mt-4 p-3 bg-green-50 rounded-md">
                          <div className="text-sm font-medium text-green-800 mb-2">
                            Extracted Data:
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Invoice:</span>{' '}
                              {order.invoiceNumber}
                            </div>
                            <div>
                              <span className="text-gray-500">Due Date:</span>{' '}
                              {order.dueDate
                                ? new Date(order.dueDate).toLocaleDateString()
                                : ''}
                            </div>
                            <div>
                              <span className="text-gray-500">Bank:</span>{' '}
                              {order.bankInfo?.bankName}
                            </div>
                            <div>
                              <span className="text-gray-500">IBAN:</span>{' '}
                              {order.bankInfo?.iban}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  WhatsApp Order Workflow
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create order from stock needs or manually</li>
                    <li>Click "Chat" to open WhatsApp conversation</li>
                    <li>Send order via WhatsApp to provider</li>
                    <li>Provider sends PDF receipt</li>
                    <li>Upload receipt to extract payment details</li>
                    <li>Review and confirm extracted data</li>
                    <li>Process payment and send confirmation</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* WhatsApp Chat Modal */}
      {selectedOrder && (
        <WhatsAppChat
          orderId={selectedOrder.id}
          providerName={getProviderName(selectedOrder.providerId)}
          providerPhone={getProviderPhone(selectedOrder.providerId)}
          isOpen={isWhatsAppOpen}
          onClose={() => {
            setIsWhatsAppOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSuggestedOrder(null);
        }}
        onCreateOrder={handleCreateOrder}
        providers={providers}
        stockItems={stockItems}
        suggestedOrder={suggestedOrder}
      />
    </div>
  );
}
