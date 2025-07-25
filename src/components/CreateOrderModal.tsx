'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Provider, OrderItem, StockItem } from '../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: {
    providerId: string;
    items: OrderItem[];
    notes: string;
  }) => void;
  providers: Provider[];
  stockItems: StockItem[];
  suggestedOrder?: {
    productName: string;
    suggestedQuantity: number;
    unit: string;
    suggestedProviders: Provider[];
  };
  selectedProviderId?: string | null;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onCreateOrder,
  providers,
  stockItems,
  suggestedOrder,
  selectedProviderId,
}: CreateOrderModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [orderText, setOrderText] = useState('');
  const [notes, setNotes] = useState('');

  // Set selectedProvider from prop if provided
  useEffect(() => {
    if (selectedProviderId && selectedProviderId !== selectedProvider) {
      setSelectedProvider(selectedProviderId);
    }
  }, [selectedProviderId]);

  // Set selectedProvider and orderText from suggestedOrder if present
  useEffect(() => {
    if (suggestedOrder) {
      if (suggestedOrder.suggestedProviders && suggestedOrder.suggestedProviders.length > 0) {
        setSelectedProvider(suggestedOrder.suggestedProviders[0].id);
      }
      setOrderText(`${suggestedOrder.productName}: ${suggestedOrder.suggestedQuantity} ${suggestedOrder.unit}`);
    }
  }, [suggestedOrder]);

  // Generate suggested order text when provider is selected
  useEffect(() => {
    if (selectedProvider && !suggestedOrder) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider) {
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        // Suggest items where associatedProviders includes selectedProvider and preferredProvider is empty or matches
        const matchingItems = stockItems.filter(stock =>
          stock.associatedProviders.includes(selectedProvider) &&
          (!stock.preferredProvider || stock.preferredProvider === selectedProvider)
        );
        // Urgent items first (nextOrder due soon)
        const urgentItems = matchingItems.filter(stock => stock.nextOrder && new Date(stock.nextOrder) <= weekFromNow);
        const nonUrgentItems = matchingItems.filter(stock => !urgentItems.includes(stock));
        const itemsToSuggest = [...urgentItems, ...nonUrgentItems];
        if (itemsToSuggest.length > 0) {
          const suggestedText = itemsToSuggest.map(stock => {
            let suggestedQty = stock.quantity;
            if (Array.isArray(stock.consumptionHistory) && stock.consumptionHistory.length > 0) {
              suggestedQty = Math.round(stock.consumptionHistory.reduce((a, b) => a + b, 0) / stock.consumptionHistory.length);
            }
            // Elimina el status del final
            return `${stock.productName}: ${suggestedQty} ${stock.unit}`;
          }).join('\n');
          setOrderText(suggestedText);
        } else {
          setOrderText('');
        }
      }
    } else if (suggestedOrder) {
      // Handle suggested order from sidebar
      const suggestedText = `${suggestedOrder.productName}: ${suggestedOrder.suggestedQuantity} ${suggestedOrder.unit} - $0 (SUGERIDO)`;
      setOrderText(suggestedText);
    }
  }, [selectedProvider, providers, stockItems, suggestedOrder]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProvider('');
      setOrderText('');
      setNotes('');
    }
  }, [isOpen]);

  // Remove handleRefreshSuggestions and the Refresh Suggestions button from the UI

  const parseOrderText = (text: string): OrderItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: OrderItem[] = [];

    lines.forEach(line => {
      // Permite formato: "Producto: cantidad unidad" (sin precio)
      const match = line.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s+(\w+)/);
      if (match) {
        const [, productName, quantity, unit] = match;
        items.push({
          productName: productName.trim(),
          quantity: parseFloat(quantity),
          unit: unit.trim(),
          price: 0,
          total: 0,
        });
      }
    });

    return items;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DEBUG Modal: handleSubmit ejecutado', { selectedProvider, orderText, notes });
    if (!selectedProvider) return;

    const items = parseOrderText(orderText);
    if (items.length === 0) {
      return;
    }

    onCreateOrder({
      providerId: selectedProvider,
      items,
      notes,
    });

    onClose();
  };

  const totalAmount = parseOrderText(orderText).reduce((sum, item) => sum + item.total, 0);

  // Get provider info for display
  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);

  // Haz el resumen del pedido expandible/colapsable
  const [showSummary, setShowSummary] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Crear nuevo pedido
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona proveedor *
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Elige un proveedor...</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.email}
                </option>
              ))}
            </select>
            
            {selectedProviderInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Categorías del proveedor:</strong> {selectedProviderInfo.categories.join(', ')}
                </div>
                {selectedProviderInfo.notes && (
                  <div className="text-sm text-blue-700 mt-1">
                    <strong>Notas:</strong> {selectedProviderInfo.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items Text */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">Ítems del pedido</h3>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ítems del pedido (Formato: Producto: Cantidad Unidad - Precio)
              </label>
            </div>

            <textarea
              value={orderText}
              onChange={(e) => setOrderText(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Selecciona un proveedor para ver ítems sugeridos..."
            />

            {/* Order Summary */}
            {orderText.trim() && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <button
                  className="text-blue-600 text-sm mb-2 focus:outline-none"
                  onClick={() => setShowSummary(s => !s)}
                >
                  {showSummary ? 'Ocultar resumen' : 'Mostrar resumen'}
                </button>
                {showSummary && (
                  <>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen del pedido</h4>
                    <div className="space-y-2">
                      {parseOrderText(orderText).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.productName} - {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${totalAmount.toFixed(0)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Instrucciones especiales o notas de entrega..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={() => console.log('DEBUG Modal: Botón crear pedido clickeado')}
            disabled={!selectedProvider || !orderText.trim()}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Crear pedido
          </button>
        </div>
      </div>
    </div>
  );
} 