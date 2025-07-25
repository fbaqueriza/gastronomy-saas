"use client";

import { useState, useCallback } from "react";
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Navigation from "../../components/Navigation";
import SuggestedOrders from "../../components/SuggestedOrders";
import CreateOrderModal from "../../components/CreateOrderModal";
import { Order, OrderItem, Provider, StockItem } from "../../types";
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
  Users,
  TrendingUp,
  Package,
  CreditCard,
  Calendar,
} from "lucide-react";
import {
  DataProvider,
  useData,
} from "../../components/DataProvider";
import es from "../../locales/es";
import WhatsAppChat from "../../components/WhatsAppChat";
import PendingOrderList from '../../components/PendingOrderList';
import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';

export default function DashboardPageWrapper() {
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
      <DashboardPage />
    </DataProvider>
  );
}

function DashboardPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { orders, providers, stockItems } = useData();
  // Remove isSeedUser and mockConversations logic
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [paymentProofs, setPaymentProofs] = useState<{ [orderId: string]: { url: string; name: string } }>({});

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;
  return (
    <DashboardPageContent
      orders={orders}
      providers={providers}
      stockItems={stockItems}
      isCreateModalOpen={isCreateModalOpen}
      setIsCreateModalOpen={setIsCreateModalOpen}
      suggestedOrder={suggestedOrder}
      setSuggestedOrder={setSuggestedOrder}
      isChatOpen={isChatOpen}
      setIsChatOpen={setIsChatOpen}
      user={user}
      selectedProviderId={typeof selectedProviderId === 'string' ? selectedProviderId : null}
      setSelectedProviderId={setSelectedProviderId}
      paymentProofs={paymentProofs}
      setPaymentProofs={setPaymentProofs}
    />
  );
}

function DashboardPageContent({
  orders,
  providers,
  stockItems,
  isCreateModalOpen,
  setIsCreateModalOpen,
  suggestedOrder,
  setSuggestedOrder,
  isChatOpen,
  setIsChatOpen,
  user,
  selectedProviderId,
  setSelectedProviderId,
  paymentProofs,
  setPaymentProofs,
}: {
  orders: Order[];
  providers: Provider[];
  stockItems: StockItem[];
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  suggestedOrder: any;
  setSuggestedOrder: (order: any) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  user: any;
  selectedProviderId: string | null;
  setSelectedProviderId: (id: string | null) => void;
  paymentProofs: { [orderId: string]: { url: string; name: string } };
  setPaymentProofs: (proofs: { [orderId: string]: { url: string; name: string } }) => void;
}) {
  const { addOrder } = useData();
  // Calculate pending orders (not delivered)
  const pendingOrders = orders.filter((order: Order) => order.status !== 'delivered').length;
  // Calculate upcoming orders (stock items with próxima orden within 7 days)
  const upcomingOrders = stockItems.filter((item: StockItem) => {
    if (!item.nextOrder) return false;
    const nextOrder = new Date(item.nextOrder);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return nextOrder <= weekFromNow;
  });
  const totalProviders = providers.length;
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // Añadir o reemplazar la función getProviderName para que devuelva siempre un string válido
  const getProviderName = (providers: Provider[], providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider && provider.name) {
      return provider.name;
    } else if (providerId) {
      return `(ID: ${providerId})`;
    } else {
      return 'Proveedor desconocido';
    }
  };
  const handleCreateOrder = async (orderData: {
    providerId: string;
    items: OrderItem[];
    notes: string;
  }) => {
    if (!user) return;
    const newOrder: Partial<Order> = {
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      providerId: orderData.providerId,
      items: orderData.items,
      status: "pending",
      totalAmount: orderData.items.reduce((sum, item) => sum + item.total, 0),
      currency: "ARS",
      orderDate: new Date(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      invoiceNumber: "",
      bankInfo: {},
      receiptUrl: "",
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      user_id: user.id,
    };
    await addOrder(newOrder, user.id);
    setIsCreateModalOpen(false);
    setSuggestedOrder(null);
  };
  const handleSuggestedOrderCreate = (suggestedOrder: any) => {
    setSuggestedOrder(suggestedOrder);
    setSelectedProviderId((suggestedOrder?.suggestedProviders?.[0]?.id as string) ?? null);
    setIsCreateModalOpen(true);
  };
  const handleProviderOrder = (providerId: string) => {
    setSelectedProviderId(providerId ?? null);
    setIsCreateModalOpen(true);
  };
  // Helper: get last order date for a provider
  function getProviderLastOrderDate(providerId: string): Date | null {
    const providerOrders = Array.isArray(orders) ? orders.filter((o: any) => o.providerId === providerId) : [];
    if (providerOrders.length === 0) return null;
    return new Date(Math.max(...providerOrders.map((o: any) => new Date(o.orderDate).getTime())));
  }
  // Helper: check if provider has active/pending orders
  function providerHasActiveOrder(providerId: string): boolean {
    return Array.isArray(orders) && orders.some((o: any) => o.providerId === providerId && ['pending', 'sent', 'confirmed'].includes(o.status));
  }
  // Helper: check if provider has imminent order (next order for any of their products within 7 days)
  function providerHasImminentOrder(providerId: string): boolean {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return Array.isArray(stockItems) && stockItems.some((item: any) =>
      Array.isArray(item.associatedProviders) && item.associatedProviders.includes(providerId) && item.nextOrder && new Date(item.nextOrder) <= weekFromNow
    );
  }
  // Sort providers
  const sortedProviders = [...providers].sort((a, b) => {
    // 1. Active/pending orders
    const aActive = providerHasActiveOrder(a.id);
    const bActive = providerHasActiveOrder(b.id);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    // 2. Imminent order
    const aImminent = providerHasImminentOrder(a.id);
    const bImminent = providerHasImminentOrder(b.id);
    if (aImminent && !bImminent) return -1;
    if (!aImminent && bImminent) return 1;
    // 3. Most recent order date
    const aLast = getProviderLastOrderDate(a.id);
    const bLast = getProviderLastOrderDate(b.id);
    if (aLast && bLast) return bLast.getTime() - aLast.getTime();
    if (aLast) return -1;
    if (bLast) return 1;
    return 0;
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Remove floating chat button */}
      {/* Header */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-x-8 gap-y-8">
          {/* Left Section: Pedidos pendientes + Pedidos recientes */}
          <div className="w-full">
            {/* Pedidos pendientes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-6 shadow">
              <h2 className="text-xl font-bold text-yellow-800 mb-4">Pedidos pendientes</h2>
              {orders.filter((o: Order) => o.status === 'pending' || o.status === 'sent' || o.status === 'confirmed').length === 0 ? (
                <ul className="divide-y divide-yellow-100">
                  {/* Mock pending order for visual testing */}
                  <li className="py-3 flex flex-col gap-1 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">Proveedor Demo</span>
                        <span className="ml-2 text-gray-500 text-sm">{new Date().toLocaleDateString()}</span>
                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">En curso</span>
                      </div>
                      <button className="text-blue-600 hover:underline text-sm flex items-center cursor-not-allowed" title="Ver chat">
                        Ver más
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Sin mensajes</div>
                  </li>
                </ul>
              ) : (
                <PendingOrderList
                  orders={orders.filter((o: Order) => o.status === 'pending' || o.status === 'sent' || o.status === 'confirmed')}
                  providers={providers}
                  onViewChat={(order) => {}}
                  onUploadReceipt={(order, file) => {
                    const url = URL.createObjectURL(file);
                    setPaymentProofs({ ...paymentProofs, [order.id]: { url, name: file.name } });
                    // setOrders(orders.map((o: Order) => { // This line was removed as per the edit hint
                    //   if (o.id === order.id) {
                    //     if (o.status === 'sent') {
                    //       return { ...o, status: 'confirmed', updatedAt: new Date() };
                    //     }
                    //     return { ...o };
                    //   }
                    //   return o;
                    // }));
                  }}
                  onSendOrder={(order) => {
                    // setOrders(orders.map((o: Order) => // This line was removed as per the edit hint
                    //   o.id === order.id ? { ...o, status: 'sent', updatedAt: new Date() } : o
                    // ));
                  }}
                  paymentProofs={paymentProofs}
                  onConfirmReception={(order) => {
                    // setOrders(orders.map((o: Order) => // This line was removed as per the edit hint
                    //   o.id === order.id ? { ...o, status: 'delivered', updatedAt: new Date() } : o
                    // ));
                  }}
                />
              )}
            </div>
            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />
            {/* Pedidos recientes */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Pedidos recientes</h2>
              {(orders.filter((o: any) => (o.status === 'delivered' || o.status === 'confirmed') && new Date(o.orderDate) > new Date(Date.now() - 30*24*60*60*1000)).length === 0) ? (
                <ul className="divide-y divide-gray-100">
                  {/* Mock recent order for visual testing */}
                  <li className="py-3 flex flex-col gap-1 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">Proveedor Demo</span>
                        <span className="ml-2 text-gray-500 text-sm">{new Date().toLocaleDateString()}</span>
                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completado</span>
                    </div>
                      <button className="text-blue-600 hover:underline text-sm flex items-center cursor-not-allowed" title="Ver chat">
                        Ver más
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">Sin mensajes</div>
                  </li>
                </ul>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {orders.filter((o: any) => (o.status === 'delivered' || o.status === 'confirmed') && new Date(o.orderDate) > new Date(Date.now() - 30*24*60*60*1000))
                    .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                    .map((order: any) => {
                      const provider = providers.find((p: any) => p.id === order.providerId);
                      // const conv = mockConversations?.[provider?.id ?? '']; // This line was removed as per the edit hint
                      // const lastMsg = conv?.messages[conv.messages.length - 1]?.message || 'Sin mensajes'; // This line was removed as per the edit hint
                      const lastMsg = 'Sin mensajes'; // Placeholder as mockConversations is removed
                      return (
                        <li key={order.id} className="py-3 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{provider?.name || 'Proveedor'}</span>
                              <span className="ml-2 text-gray-500 text-sm">{new Date(order.orderDate).toLocaleDateString()}</span>
                              <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completado</span>
                  </div>
                            <Menu as="div" className="relative inline-block text-left">
  <Menu.Button className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400">
    Ver documentos
  </Menu.Button>
  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999] transform -translate-y-1">
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
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-full" title={lastMsg}>{lastMsg.length > 80 ? lastMsg.slice(0, 80) + '…' : lastMsg}</div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
          {/* Right Section: Próximos pedidos + Providers table */}
          <div className="w-full">
            {/* Próximos pedidos */}
            <div className="bg-blue-100 border-l-8 border-blue-400 rounded-xl p-5 mb-6 shadow-lg">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Próximos pedidos</h2>
              {user?.email === 'test@test.com' ? (
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                  {[
                    {
                      providerName: "Panadería Los Hermanos",
                      frecuenciaDias: 7,
                      ultimaOrden: "2025-07-15",
                      proximaOrden: "2025-07-22",
                      diasRestantes: 1,
                      lastMessage: "¿Van a necesitar el pan integral esta semana?"
                    },
                    {
                      providerName: "Distribuciones Verduras Martínez",
                      frecuenciaDias: 7,
                      ultimaOrden: "2025-07-14",
                      proximaOrden: "2025-07-21",
                      diasRestantes: 0,
                      lastMessage: "La última entrega fue el lunes. ¿Confirmamos para mañana?"
                    }
                  ]
                    .sort((a, b) => new Date(a.proximaOrden).getTime() - new Date(b.proximaOrden).getTime())
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className={`bg-white rounded-lg p-4 flex flex-col gap-1 shadow-sm border-l-4 ${item.diasRestantes <= 1 ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{item.providerName}</span>
                          <span className={`ml-2 text-sm ${item.diasRestantes <= 1 ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>{new Date(item.proximaOrden).toLocaleDateString()} ({item.diasRestantes === 0 ? 'Hoy' : `En ${item.diasRestantes} día${item.diasRestantes > 1 ? 's' : ''}`})</span>
        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-full" title={item.lastMessage}>{item.lastMessage.length > 80 ? item.lastMessage.slice(0, 80) + '…' : item.lastMessage}</div>
          </div>
                    ))}
              </div>
              ) : (
                (() => {
                  // Real upcoming orders for real users
                  const now = new Date();
                  const weekFromNow = new Date();
                  weekFromNow.setDate(now.getDate() + 7);
                  // Find providers with next order due in 7 days
                  const providerUpcoming = providers
                    .map((provider: Provider) => {
                      const nextOrderDates = stockItems
                        .filter((item: StockItem) => Array.isArray(item.associatedProviders) && item.associatedProviders.includes(provider.id) && item.nextOrder)
                        .map((item: StockItem) => item.nextOrder ? new Date(item.nextOrder as string | number | Date) : null)
                        .filter((d): d is Date => d !== null);
                      const nextExpectedOrderDate = nextOrderDates.length > 0 ? new Date(Math.min(...nextOrderDates.map((d: Date) => d.getTime()))) : null;
                      return { provider, nextExpectedOrderDate };
                    })
                    .filter(({ nextExpectedOrderDate }: { nextExpectedOrderDate: Date | null }) => nextExpectedOrderDate && nextExpectedOrderDate <= weekFromNow)
                    .sort((a: { nextExpectedOrderDate: Date | null }, b: { nextExpectedOrderDate: Date | null }) => (a.nextExpectedOrderDate as Date).getTime() - (b.nextExpectedOrderDate as Date).getTime());
                  if (providerUpcoming.length === 0) {
                    return <div className="text-gray-500 text-sm">No hay próximos pedidos en los próximos 7 días.</div>;
                  }
                  return (
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                      {providerUpcoming.map(({ provider, nextExpectedOrderDate }: { provider: Provider, nextExpectedOrderDate: Date | null }, idx: number) => (
                        <div
                          key={provider.id}
                          className={`bg-white rounded-lg p-4 flex flex-col gap-1 shadow-sm border-l-4 ${(nextExpectedOrderDate && (nextExpectedOrderDate.getTime() - now.getTime()) < 2*24*60*60*1000) ? 'border-blue-500' : 'border-transparent'}`}
                        >
                      <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{provider.name}</span>
                            <span className={`ml-2 text-sm ${(nextExpectedOrderDate && (nextExpectedOrderDate.getTime() - now.getTime()) < 2*24*60*60*1000) ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>{nextExpectedOrderDate ? nextExpectedOrderDate.toLocaleDateString() : '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
            {/* Providers Table */}
            <div className="bg-white rounded-lg p-4 shadow max-h-96 overflow-y-auto">
              <h2 className="text-md font-bold text-gray-800 mb-2">Proveedores</h2>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última orden</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                <tbody>
                  {providers.map((provider: any) => {
                    // Find most recent order for this provider
                    const providerOrders = orders.filter((o: any) => o.providerId === provider.id);
                    const mostRecentOrder = providerOrders.length > 0 ? providerOrders.reduce((a: any, b: any) => new Date(a.orderDate) > new Date(b.orderDate) ? a : b) : null;
                    const lastOrderDate = mostRecentOrder ? new Date(mostRecentOrder.orderDate) : null;
                      return (
                        <tr key={provider.id} className="hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-900">{provider.name}</td>
                        <td className="py-2 text-xs text-gray-500">{lastOrderDate ? lastOrderDate.toLocaleDateString() : '-'}</td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleProviderOrder(provider.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Nuevo pedido"
                          >
                            <Plus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSuggestedOrder(null);
          setSelectedProviderId(null);
        }}
        onCreateOrder={handleCreateOrder}
        providers={providers}
        stockItems={stockItems}
        suggestedOrder={suggestedOrder}
        selectedProviderId={typeof selectedProviderId === 'string' ? selectedProviderId : null}
      />
      {/* Split-pane chat UI */}
      {false && (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 z-40 bg-white shadow-xl flex flex-col">
          <WhatsAppChat
            orderId={orders[0]?.id || ""}
            providerName={
              providers.find((p: Provider) => p.id === selectedProviderId)?.name ||
              "Proveedor"
            }
            providerPhone={
              providers.find((p: Provider) => p.id === selectedProviderId)?.phone || ""
            }
            isOpen={!!selectedProviderId}
            onClose={() => setSelectedProviderId(null)}
          />
        </div>
      )}
    </div>
  );
}

