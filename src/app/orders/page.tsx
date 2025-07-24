'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSupabaseUser } from '../../hooks/useSupabaseUser';
import Navigation from '../../components/Navigation';
import WhatsAppChat from '../../components/WhatsAppChat';
import SuggestedOrders from '../../components/SuggestedOrders';
import CreateOrderModal from '../../components/CreateOrderModal';
import ComprobanteButton from '../../components/ComprobanteButton';
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
  Clipboard,
  Check,
  Download,
} from 'lucide-react';
import { DataProvider, useData } from '../../components/DataProvider';
import es from '../../locales/es';
import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';

export default function OrdersPageWrapper() {
  const { user, loading: authLoading } = useSupabaseUser();
  const router = useRouter();
  if (!authLoading && !user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Cargando...</p></div></div>;
  }
  return (
    <DataProvider userEmail={user?.email}>
      <OrdersPage />
    </DataProvider>
  );
}

function OrdersPage() {
  // user y authLoading ya están definidos arriba
  const { orders, setOrders, providers, setProviders, stockItems, setStockItems } = useData();
  const isSeedUser = user?.email === 'test@test.com';

  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState<any>(null);
  const [bulkReceipts, setBulkReceipts] = useState<File[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAssignments, setBulkAssignments] = useState<any[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<any[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<{ [orderId: string]: { url: string; name: string } }>(
    {}
  );
  const [transferSent, setTransferSent] = useState<{ [orderId: string]: boolean }>({});
  // Estado para feedback de copia
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Generar automáticamente la Orden de Pago mock cuando el pedido esté en 'sent' y no tenga orden de pago
  useEffect(() => {
    const newPaymentOrders = [...paymentOrders];
    orders.forEach(order => {
      if (
        order.status === 'sent' &&
        !newPaymentOrders.some(po => po.orderId === order.id)
      ) {
        const provider = providers.find(p => p.id === order.providerId);
        if (provider) {
          newPaymentOrders.push({
            orderId: order.id,
            providerName: provider.name,
            amount: 12345, // mock, igual que la factura
            currency: 'ARS',
            cbu: provider.cbu || '1230001123000112300011',
            alias: provider.alias || 'PROVEEDOR.DEMO',
            bank: provider.razonSocial || provider.notes || 'Banco Mock',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: 'pending',
          });
        }
      }
    });
    if (JSON.stringify(newPaymentOrders) !== JSON.stringify(paymentOrders)) {
      setPaymentOrders(newPaymentOrders);
    }
  }, [orders, providers]);

  // Simulación de procesamiento y asignación mock
  useEffect(() => {
    if (isBulkModalOpen && bulkReceipts.length > 0) {
      // Simular procesamiento y asignación
      const assignments = bulkReceipts.map((file, idx) => {
        // Datos mock extraídos
        const mockAmount = 100 + idx * 10;
        const mockDate = new Date(Date.now() - idx * 86400000); // días atrás
        const mockProvider = providers[idx % providers.length];
        // Buscar pedido pendiente con proveedor y monto similar
        const matchedOrder = orders.find(
          o => o.status === 'pending' &&
            o.providerId === mockProvider?.id &&
            Math.abs(o.totalAmount - mockAmount) < 20 &&
            Math.abs(new Date(o.orderDate).getTime() - mockDate.getTime()) < 3 * 86400000
        );
        return {
          file,
          extracted: {
            totalAmount: mockAmount,
            date: mockDate,
            providerName: mockProvider?.name || 'Desconocido',
          },
          assignedOrder: matchedOrder || null,
        };
      });
      setBulkAssignments(assignments);
    } else if (!isBulkModalOpen) {
      setBulkAssignments([]);
    }
  }, [isBulkModalOpen, bulkReceipts, providers, orders]);

  const handleCopyField = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1200);
  };

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
    return provider?.name || providerId;
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
    if (!user) return;
    const newOrder: Order = {
      id: Date.now().toString(),
      user_id: user.id,
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      providerId: orderData.providerId, // Debe ser ID
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

  // Handler para subir comprobante de pago
  const handleUploadPaymentProof = (orderId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setPaymentProofs((prev) => ({ ...prev, [orderId]: { url, name: file.name } }));
    // Marcar la orden como pagada (confirmed) al subir comprobante
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId && (order.status === 'sent' || order.status === 'confirmed')
          ? { ...order, status: 'confirmed' } : order
      )
    );
    setPaymentOrders((prev) =>
      prev.map((po) =>
        po.orderId === orderId ? { ...po, status: 'confirmed' } : po
      )
    );
  };

  // Handler para confirmar recepción
  const handleConfirmReception = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' } : order
      )
    );
  };

  const handleSendTransfer = (orderId: string) => {
    setTransferSent((prev) => ({ ...prev, [orderId]: true }));
  };

  if (loading) {
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

  // Ordenar órdenes por fecha descendente
  const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  const currentOrders = sortedOrders.filter(order => !['delivered', 'cancelled'].includes(order.status));
  let finishedOrders = sortedOrders.filter(order => order.status === 'delivered');
  // Filtros
  if (filterProvider) finishedOrders = finishedOrders.filter(o => o.providerId === filterProvider);
  if (filterStartDate) finishedOrders = finishedOrders.filter(o => new Date(o.orderDate) >= new Date(filterStartDate));
  if (filterEndDate) finishedOrders = finishedOrders.filter(o => new Date(o.orderDate) <= new Date(filterEndDate));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {es.orders.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {es.orders.description}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                {es.orders.newOrder}
              </button>
              {/* Botón para carga masiva de comprobantes */}
              <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Subir comprobantes
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setBulkReceipts(Array.from(e.target.files));
                      setIsBulkModalOpen(true);
                    }
                  }}
                />
              </label>
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
                  {es.orders.currentOrdersTitle} ({currentOrders.length})
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <li key={order.id} className="py-3 px-2 flex flex-col gap-1 bg-white rounded-lg shadow mb-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
                      {/* Lado izquierdo: info del pedido */}
                      <div className="flex-1 min-w-0 sm:w-7/12">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(order.status)}
                          <span className="font-medium text-gray-900">{order.orderNumber}</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status === 'pending' ? 'Pendiente' : order.status === 'sent' ? 'Enviado' : order.status === 'confirmed' ? 'Pagado' : order.status === 'delivered' ? 'Finalizado' : order.status === 'cancelled' ? 'Cancelado' : order.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                          <span>{getProviderName(order.providerId)}</span>
                          <span>•</span>
                          <span>{order.items.length} ítems</span>
                          <span>•</span>
                          <span>{order.totalAmount} {order.currency}</span>
                          <span>•</span>
                          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600">
                          {order.items.slice(0, 2).map((item, index) => (
                            <span key={index}>{item.productName} - {item.quantity} {item.unit}</span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-gray-400">+{order.items.length - 2} más</span>
                          )}
                        </div>
                      </div>
                      {/* Lado derecho: botones de acción */}
                      <div className="flex flex-col items-end gap-1 sm:w-5/12 min-w-[160px]">
                        <div className="flex flex-row flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" /> Chat
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleSendOrder(order.id)}
                              disabled={loading}
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {es.orders.sendOrder}
                            </button>
                          )}
                          {['sent','confirmed','delivered'].includes(order.status) && (
                            <a
                              href={order.receiptUrl || '/mock-factura.pdf'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar factura
                            </a>
                          )}
                          {['sent','confirmed','delivered'].includes(order.status) && (
                            <ComprobanteButton
                              comprobante={paymentProofs[order.id] || null}
                              onUpload={(file) => handleUploadPaymentProof(order.id, file)}
                              onView={() => {
                                if (paymentProofs[order.id]) {
                                  window.open(paymentProofs[order.id].url, '_blank');
                                }
                              }}
                            />
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-blue-200 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                              onClick={() => handleConfirmReception(order.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Confirmar recepción
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Tabla de Órdenes Finalizadas mejorada */}
            <div className="bg-gray-50 shadow overflow-hidden sm:rounded-md mt-8">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Órdenes finalizadas ({finishedOrders.length})
                </h3>
                <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={filterProvider}
                    onChange={e => setFilterProvider(e.target.value)}
                  >
                    <option value="">Todos los proveedores</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-xs"
                    value={filterStartDate}
                    onChange={e => setFilterStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-xs"
                    value={filterEndDate}
                    onChange={e => setFilterEndDate(e.target.value)}
                  />
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {finishedOrders.map((order) => (
                  <li key={order.id} className="py-3 px-2 flex flex-col gap-1 bg-white rounded-lg shadow mb-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
                      {/* Lado izquierdo: info del pedido */}
                      <div className="flex-1 min-w-0 sm:w-7/12">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(order.status)}
                          <span className="font-medium text-gray-900">{order.orderNumber}</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800`}>
                            Finalizada
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                          <span>{getProviderName(order.providerId)}</span>
                          <span>•</span>
                          <span>{order.items.length} ítems</span>
                          <span>•</span>
                          <span>{order.totalAmount} {order.currency}</span>
                          <span>•</span>
                          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600">
                          {order.items.slice(0, 2).map((item, index) => (
                            <span key={index}>{item.productName} - {item.quantity} {item.unit}</span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-gray-400">+{order.items.length - 2} más</span>
                          )}
                        </div>
                      </div>
                      {/* Lado derecho: botón de documentos */}
                      <div className="flex flex-col items-end gap-1 sm:w-5/12 min-w-[160px] justify-center">
                        <Menu as="div" className="relative inline-block text-left">
                          <Menu.Button className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400">
                            Ver documentos
                          </Menu.Button>
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="py-1 flex flex-col gap-1">
                              <button
                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!order.receiptUrl}
                                onClick={() => { if(order.receiptUrl) window.open(order.receiptUrl, '_blank'); }}
                              >
                                {order.receiptUrl ? 'Descargar pedido' : 'Pedido no disponible'}
                              </button>
                              <button
                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!order.invoiceNumber}
                                onClick={() => { if(order.invoiceNumber) window.open('/mock-factura.pdf', '_blank'); }}
                              >
                                {order.invoiceNumber ? 'Descargar factura' : 'Factura no disponible'}
                              </button>
                              <button
                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!paymentProofs[order.id]}
                                onClick={() => { if(paymentProofs[order.id]) window.open(paymentProofs[order.id].url, '_blank'); }}
                              >
                                {paymentProofs[order.id] ? 'Descargar comprobante' : 'Comprobante no disponible'}
                              </button>
                            </div>
                          </Menu.Items>
                        </Menu>
                      </div>
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
                  {es.orders.whatsAppFlowTitle}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{es.orders.createOrderStep}</li>
                    <li>{es.orders.sendWhatsAppStep}</li>
                    <li>{es.orders.sendOrderStep}</li>
                    <li>{es.orders.sendReceiptStep}</li>
                    <li>{es.orders.uploadReceiptStep}</li>
                    <li>{es.orders.reviewDataStep}</li>
                    <li>{es.orders.processPaymentStep}</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* WhatsApp Chat Split Panel */}
      {selectedOrder && (
        <div className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 z-40 transition-transform duration-300 ${isWhatsAppOpen ? 'translate-x-0' : 'translate-x-full'} bg-white shadow-xl flex flex-col`}>
          <WhatsAppChat
            orderId={selectedOrder.id}
            providerName={getProviderName(selectedOrder.providerId)}
            providerPhone={getProviderPhone(selectedOrder.providerId)}
            isOpen={isWhatsAppOpen}
            onClose={() => {
              setIsWhatsAppOpen(false);
              setSelectedOrder(null);
            }}
            orderStatus={selectedOrder.status}
          />
        </div>
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
      {/* Modal de resumen de carga masiva (estructura base) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsBulkModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Resumen de comprobantes cargados</h2>
            <ul className="divide-y divide-gray-200 mb-4">
              {bulkAssignments.map((a, idx) => (
                <li key={idx} className="py-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.file.name}</span>
                    <span className="text-xs text-gray-400">{a.assignedOrder ? `Asignado a: ${a.assignedOrder.orderNumber}` : 'No asignado'}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex gap-4">
                    <span>Monto: {a.extracted.totalAmount}</span>
                    <span>Fecha: {a.extracted.date.toLocaleDateString()}</span>
                    <span>Proveedor: {a.extracted.providerName}</span>
                  </div>
                  <div className="mt-1">
                    <label className="text-xs mr-2">Editar asignación:</label>
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={a.assignedOrder?.id || ''}
                      onChange={e => {
                        const newAssignments = [...bulkAssignments];
                        const newOrder = orders.find(o => o.id === e.target.value) || null;
                        newAssignments[idx] = { ...a, assignedOrder: newOrder };
                        setBulkAssignments(newAssignments);
                      }}
                    >
                      <option value="">No asignado</option>
                      {orders.filter(o => o.status === 'pending').map(o => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} - {getProviderName(o.providerId)} - {o.totalAmount}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setIsBulkModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
