'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
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
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  if (!authLoading && !user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Cargando...</p></div></div>;
  }
  return (
    <DataProvider userEmail={user?.email ?? undefined} userId={user?.id}>
      {user && <OrdersPage user={user} />}
    </DataProvider>
  );
}

type OrdersPageProps = { user: any };
function OrdersPage({ user }: OrdersPageProps) {
  const { orders, providers, stockItems, addOrder, updateOrder, deleteOrder, fetchAll } = useData();
  // Only keep local state for modal and suggestedOrder
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState<any>(null);
  // Remove all other local state for orders/providers/stockItems
  // All handlers now use Supabase CRUD only
  const handleCreateOrder = async (orderData: {
    providerId: string;
    items: OrderItem[];
    notes: string;
  }) => {
    if (!user) return;
    const newOrder: Partial<Order> = {
      providerId: orderData.providerId,
      user_id: user.id,
      items: orderData.items,
      status: 'pending',
      totalAmount: orderData.items.reduce((sum, item) => sum + item.total, 0),
      currency: 'EUR',
      orderDate: new Date(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      invoiceNumber: '',
      bankInfo: {},
      receiptUrl: '',
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('DEBUG Pedido:', JSON.stringify(newOrder, null, 2));
    await addOrder(newOrder, user.id);
    setIsCreateModalOpen(false);
    setSuggestedOrder(null);
  };

  const handleSuggestedOrderCreate = (suggestedOrder: any) => {
    setSuggestedOrder(suggestedOrder);
    setIsCreateModalOpen(true);
  };

  
  // Re-add getStatusIcon and getStatusColor helpers
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

  // Add getProviderName helper
  const getProviderName = (providerId: string) => {
    const provider = providers.find((p: Provider) => p.id === providerId);
    if (provider && provider.name) {
      return provider.name;
    } else if (providerId) {
      return `(ID: ${providerId})`;
    } else {
      return 'Proveedor desconocido';
    }
  };
  // Add state and handlers for WhatsApp chat
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsWhatsAppOpen(true);
  };
  // Ordenar órdenes por fecha descendente (created_at)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime());
  const currentOrders = sortedOrders.filter(order => !['finalizado', 'cancelled', 'delivered'].includes(order.status));
  let finishedOrders = sortedOrders.filter(order => ['finalizado', 'delivered'].includes(order.status));

  // Eliminar todas las definiciones duplicadas de:
  // - handleSendOrder
  // - handleUploadPaymentProof
  // - handleConfirmReception
  // Solo debe quedar la versión después del sorting.

  // Filtros
  // if (filterProvider) finishedOrders = finishedOrders.filter(o => o.providerId === filterProvider);
  // if (filterStartDate) finishedOrders = finishedOrders.filter(o => new Date(o.orderDate) >= new Date(filterStartDate));
  // if (filterEndDate) finishedOrders = finishedOrders.filter(o => new Date(o.orderDate) <= new Date(filterEndDate));

  // After sorting and before render, define the handlers:
  // 1. Cambiar el tipo de estado a: 'pendiente', 'factura_recibida', 'pagado', 'enviado', 'finalizado'.
  // 2. Modificar los handlers:
  const handleSendOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      await updateOrder({ ...order, status: 'enviado' });
      setTimeout(() => {
        const updated = orders.find(o => o.id === orderId);
        if (updated && updated.status === 'enviado') {
          updateOrder({
            ...updated,
            status: 'factura_recibida',
            invoiceNumber: 'INV-MOCK-001',
            receiptUrl: '/mock-factura.pdf',
            bankInfo: { bankName: 'Banco Mock', accountNumber: '1234567890' },
            totalAmount: updated.totalAmount || 1000,
          });
        }
      }, 2000);
    }
  };
  const handleUploadPaymentProof = async (orderId: string, file: File) => {
    const url = URL.createObjectURL(file);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      await updateOrder({ ...order, receiptUrl: url, status: 'pagado' });
    }
  };
  const handleConfirmReception = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      await updateOrder({ ...order, status: 'finalizado' });
    }
  };

  // 1. Agregar estado para filtros
  const [filterProvider, setFilterProvider] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  // 2. Aplicar filtros a finishedOrders
  const filteredFinishedOrders = finishedOrders.filter(order => {
    const providerMatch = !filterProvider || order.providerId === filterProvider;
    const startMatch = !filterStartDate || new Date(order.orderDate) >= new Date(filterStartDate);
    const endMatch = !filterEndDate || new Date(order.orderDate) <= new Date(filterEndDate);
    return providerMatch && startMatch && endMatch;
  });

  // 1. Botón 'Enviar pedido' cuando estado === 'pending'
  // 2. Mostrar nombre del proveedor con getProviderName(order.providerId)
  // 3. Corregir formato de fecha:
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  };
  // 4. Mostrar precio solo si estado es 'factura_recibida', 'pagado', 'enviado', 'finalizado'
  const showPrice = (status: string) => ['factura_recibida','pagado','enviado','finalizado'].includes(status);
  // 5. Al apretar 'ver resumen' en la orden nueva, no cerrar el modal (asegurar onClose solo se llama en el botón cancelar o submit)
  // 6. Asegurar que las órdenes se muestran con las más recientes arriba (ya se usa sortedOrders)

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
                      // setBulkReceipts(Array.from(e.target.files)); // This state was removed
                      // setIsBulkModalOpen(true); // This state was removed
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
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status === 'pending' ? 'Pendiente' : order.status === 'enviado' ? 'Enviado' : order.status === 'factura_recibida' ? 'Factura recibida' : order.status === 'pagado' ? 'Pagado' : order.status === 'finalizado' ? 'Finalizado' : order.status === 'cancelled' ? 'Cancelado' : order.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                          <span>{getProviderName(order.providerId)}</span>
                          <span>•</span>
                          <span>{order.items.length} ítems</span>
                          <span>•</span>
                          {showPrice(order.status) && <span>{order.totalAmount} {order.currency}</span>}
                          <span>•</span>
                          <span>{formatDate(order.orderDate)}</span>
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
                          {/* Chat */}
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" /> Chat
                          </button>
                          {/* Enviar pedido */}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleSendOrder(order.id)}
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                            >
                              <Send className="h-4 w-4 mr-1" /> Enviar pedido
                            </button>
                          )}
                          {/* Descargar factura */}
                          {['factura_recibida','pagado','enviado','finalizado'].includes(order.status) && order.invoiceNumber && (
                            <a
                              href={order.receiptUrl || '/mock-factura.pdf'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400"
                            >
                              <FileText className="h-4 w-4 mr-1" /> Descargar factura
                            </a>
                          )}
                          {/* Subir comprobante */}
                          {order.status === 'factura_recibida' && (
                            <ComprobanteButton
                              comprobante={order.receiptUrl ? { url: order.receiptUrl, name: 'Comprobante' } : null}
                              onUpload={(file) => handleUploadPaymentProof(order.id, file)}
                              onView={() => { if(order.receiptUrl) window.open(order.receiptUrl, '_blank'); }}
                            />
                          )}
                          {/* Confirmar recepción */}
                          {order.status === 'pagado' && (
                            <button
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-green-200 text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                              onClick={() => handleConfirmReception(order.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Confirmar recepción
                            </button>
                          )}
                          {/* Ver comprobante */}
                          {['pagado','finalizado'].includes(order.status) && order.receiptUrl && (
                            <a
                              href={order.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                            >
                              <Upload className="h-4 w-4 mr-1" /> Ver comprobante
                            </a>
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
                  Órdenes finalizadas ({filteredFinishedOrders.length})
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
                {filteredFinishedOrders.map((order) => (
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
                          <span>{formatDate(order.orderDate)}</span>
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
                                disabled={!order.receiptUrl} // Changed to order.receiptUrl
                                onClick={() => { if(order.receiptUrl) window.open(order.receiptUrl, '_blank'); }}
                              >
                                {order.receiptUrl ? 'Descargar comprobante' : 'Comprobante no disponible'}
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
            providerPhone={getProviderName(selectedOrder.providerId)} // This was removed
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
      {/* This section was removed as per the edit hint */}
    </div>
  );
}
