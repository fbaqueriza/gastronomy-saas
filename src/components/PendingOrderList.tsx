import React from 'react';
import { Order, Provider } from '../types';
import { MessageSquare, Upload, Send, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import ComprobanteButton from './ComprobanteButton';

interface PendingOrderListProps {
  orders: Order[];
  providers: Provider[];
  onViewChat: (order: Order) => void;
  onUploadReceipt: (order: Order, file: File) => void;
  onSendOrder: (order: Order) => void;
  onConfirmReception?: (order: Order) => void;
  paymentProofs?: { [orderId: string]: { url: string; name: string } };
  loadingOrderId?: string | null;
}

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

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'sent':
      return 'Enviado';
    case 'confirmed':
      return 'Confirmado';
    case 'delivered':
      return 'Entregado';
    case 'cancelled':
      return 'Cancelado';
    case 'paid':
      return 'Pagado';
    default:
      return status;
  }
};

const PendingOrderList: React.FC<PendingOrderListProps> = ({ orders, providers, onViewChat, onUploadReceipt, onSendOrder, onConfirmReception, paymentProofs, loadingOrderId }) => {
  // Ordenar por fecha descendente
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime());
  return (
    <ul className="divide-y divide-gray-200">
      {sortedOrders.map(order => (
        <li key={order.id} className="py-3 px-2 flex flex-col gap-1 bg-white rounded-lg shadow mb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
            {/* Lado izquierdo: info del pedido */}
            <div className="flex-1 min-w-0 sm:w-7/12">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(order.status)}
                <span className="font-medium text-gray-900">{order.orderNumber}</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                <span>{getProviderName(providers, order.providerId)}</span>
                <span>•</span>
                <span>{order.items.length} ítems</span>
                <span>•</span>
                <span>{order.totalAmount} {order.currency}</span>
                <span>•</span>
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600">
                {order.items.slice(0, 2).map((item, idx) => (
                  <span key={idx}>{item.productName} - {item.quantity} {item.unit}</span>
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
                  onClick={() => onViewChat(order)}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MessageSquare className="h-4 w-4 mr-1" /> Chat
                </button>
                {/* Enviar pedido */}
                {order.status === 'pending' && (
                  <button
                    onClick={() => onSendOrder(order)}
                    className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <Send className="h-4 w-4 mr-1" /> Enviar pedido
                  </button>
                )}
                {/* Subir comprobante */}
                {order.status === 'sent' && (
                  <ComprobanteButton
                    comprobante={paymentProofs?.[order.id] || (order.receiptUrl ? { url: order.receiptUrl, name: 'Comprobante' } : null)}
                    onUpload={(file) => onUploadReceipt(order, file)}
                    onView={() => {
                      if (paymentProofs?.[order.id]) {
                        window.open(paymentProofs[order.id].url, '_blank');
                      } else if (order.receiptUrl) {
                        window.open(order.receiptUrl, '_blank');
                      }
                    }}
                  />
                )}
                {/* Confirmar recepción */}
                {order.status === 'confirmed' && onConfirmReception && (
                  <button
                    onClick={() => onConfirmReception(order)}
                    className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition border border-green-200 text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Confirmar recepción
                  </button>
                )}
                {/* Ver comprobante */}
                {(order.status === 'delivered' || paymentProofs?.[order.id] || order.receiptUrl) && (
                  <a
                    href={paymentProofs?.[order.id]?.url || order.receiptUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <Upload className="h-4 w-4 mr-1" /> Ver comprobante
                  </a>
                )}
                {/* Descargar factura */}
                <a
                  href={order.receiptUrl || '/mock-factura.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400"
                >
                  <FileText className="h-4 w-4 mr-1" /> Descargar factura
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PendingOrderList; 