'use client';

import { useState, useEffect } from 'react';
import { Clock, Send, CheckCircle, XCircle } from 'lucide-react';

interface PendingOrder {
  orderId: string;
  providerId: string;
  providerPhone: string;
  orderData: {
    order: any;
    provider: any;
    items: any[];
  };
  status: string;
  createdAt: string;
}

export default function PendingOrderList() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      const response = await fetch('/api/whatsapp/get-all-pending-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data.pendingOrders || []);
      } else {
        console.error('Error cargando pedidos pendientes:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando pedidos pendientes:', error);
    }
  };

  const sendOrderDetails = async (providerPhone: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send-order-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerPhone }),
      });

      const result = await response.json();

      if (result.success) {
        // Remover el pedido de la lista local
        const updatedOrders = pendingOrders.filter(po => po.providerPhone !== providerPhone);
        setPendingOrders(updatedOrders);
        localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
        
        alert('✅ Detalles del pedido enviados exitosamente');
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error enviando detalles:', error);
      alert('❌ Error enviando detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const removePendingOrder = async (providerPhone: string) => {
    try {
      const response = await fetch('/api/whatsapp/remove-pending-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerPhone }),
      });

      if (response.ok) {
        const updatedOrders = pendingOrders.filter(po => po.providerPhone !== providerPhone);
        setPendingOrders(updatedOrders);
      } else {
        console.error('Error removiendo pedido pendiente:', response.statusText);
      }
    } catch (error) {
      console.error('Error removiendo pedido pendiente:', error);
    }
  };

  if (pendingOrders.length === 0) {
    return null; // No mostrar nada si no hay pedidos pendientes
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Pedidos Pendientes de Confirmación ({pendingOrders.length})
        </h3>
        <button
          onClick={loadPendingOrders}
          className="text-sm text-yellow-600 hover:text-yellow-800"
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {pendingOrders.map((pendingOrder, index) => (
          <div key={index} className="bg-white border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {pendingOrder.orderData.provider.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Pedido: {pendingOrder.orderData.order.orderNumber || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  Creado: {new Date(pendingOrder.createdAt).toLocaleString('es-AR')}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => sendOrderDetails(pendingOrder.providerPhone)}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Enviar Detalles
                </button>
                
                <button
                  onClick={() => removePendingOrder(pendingOrder.providerPhone)}
                  className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-yellow-700">
        💡 Los detalles del pedido se enviarán automáticamente cuando el proveedor responda al mensaje inicial.
        También puedes enviarlos manualmente usando el botón "Enviar Detalles".
      </div>
    </div>
  );
} 