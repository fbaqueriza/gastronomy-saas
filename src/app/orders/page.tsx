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
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      providerId: orderData.providerId,
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
    console.log('DEBUG Pedido:', { newOrder, userId: user.id });
    await addOrder(newOrder, user.id);
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
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrder({ ...order, receiptUrl: url, status: 'confirmed' });
    }
  };

  // Handler para confirmar recepción
  const handleConfirmReception = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrder({ ...order, status: 'delivered' });
    }
  };

  const handleSendTransfer = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrder({ ...order, status: 'sent' });
    }
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
    return provider?.name || providerId;
  };
  // Add state and handlers for WhatsApp chat
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsWhatsAppOpen(true);
  };
  // Add handleSendOrder for sending order (simulate WhatsApp send)
  const handleSendOrder = async (orderId: string) => {
    // You can implement WhatsApp send logic here if needed
    // For now, just update the order status to 'sent'
    const order = orders.find(o => o.id === orderId);
    if (order) {
      await updateOrder({ ...order, status: 'sent' });
    }
  };

  if (!user) {
    return null;
  }

  // Ordenar órdenes por fecha descendente
  const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  const currentOrders = sortedOrders.filter(order => !['delivered', 'cancelled'].includes(order.status));
  let finishedOrders = sortedOrders.filter(order => order.status === 'delivered');
  // Filtros
  // if (filterProvider) finishedOrders = finishedOrders.filter(o => o.providerId === filterProvider);
  // if (filterStartDate) finishedOrders = finishedOrders.filter(o => new Date(o.orderDate) >= new Date(filterStartDate));
  // if (filterEndDate) finishedOrders = finishedOrders.filter(o => new Date(o.orderDate) <= new Date(filterEndDate));

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
                              // disabled={loading} // loading was removed
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
                              comprobante={null} // Removed paymentProofs local state
                              onUpload={(file) => handleUploadPaymentProof(order.id, file)}
                              onView={() => {
                                // Removed paymentProofs local state
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
                    // value={filterProvider} // filterProvider was removed
                    onChange={e => {
                      // setFilterProvider(e.target.value); // filterProvider was removed
                    }}
                  >
                    <option value="">Todos los proveedores</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-xs"
                    // value={filterStartDate} // filterStartDate was removed
                    onChange={e => {
                      // setFilterStartDate(e.target.value); // filterStartDate was removed
                    }}
                  />
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-xs"
                    // value={filterEndDate} // filterEndDate was removed
                    onChange={e => {
                      // setFilterEndDate(e.target.value); // filterEndDate was removed
                    }}
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
