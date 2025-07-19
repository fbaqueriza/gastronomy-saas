'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onCreateOrder,
  providers,
  stockItems,
  suggestedOrder,
}: CreateOrderModalProps) {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [orderText, setOrderText] = useState('');
  const [notes, setNotes] = useState('');

  // Generate suggested order text when provider is selected
  useEffect(() => {
    if (selectedProvider && !suggestedOrder) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider) {
        // Get stock items that need ordering for this provider
        const relevantStockItems = stockItems.filter(stock => 
          stock.associatedProviders.includes(selectedProvider) &&
          (stock.currentStock < stock.minimumQuantity || 
           (stock.nextOrder && new Date(stock.nextOrder) <= new Date()))
        );

        if (relevantStockItems.length > 0) {
          const suggestedText = relevantStockItems.map(stock => {
            const neededQuantity = stock.currentStock < stock.minimumQuantity 
              ? stock.minimumQuantity - stock.currentStock 
              : stock.quantity;
            
            const stockStatus = stock.currentStock < stock.minimumQuantity 
              ? `(LOW STOCK: ${stock.currentStock} ${stock.unit})`
              : `(RESTOCK DUE: ${new Date(stock.nextOrder!).toLocaleDateString()})`;
            
            return `${stock.productName}: ${neededQuantity} ${stock.unit} - $0 ${stockStatus}`;
          }).join('\n');

          setOrderText(suggestedText);
        } else {
          // If no urgent needs, show items that are due for restock
          const restockItems = stockItems.filter(stock => 
            stock.associatedProviders.includes(selectedProvider)
          ).slice(0, 3); // Show up to 3 items

          if (restockItems.length > 0) {
            const suggestedText = restockItems.map(stock => {
              const stockStatus = stock.nextOrder && new Date(stock.nextOrder) <= new Date()
                ? `(RESTOCK DUE: ${new Date(stock.nextOrder).toLocaleDateString()})`
                : '(REGULAR ORDER)';
              
              return `${stock.productName}: ${stock.quantity} ${stock.unit} - $0 ${stockStatus}`;
            }).join('\n');

            setOrderText(suggestedText);
          }
        }
      }
    } else if (suggestedOrder) {
      // Handle suggested order from sidebar
      const suggestedText = `${suggestedOrder.productName}: ${suggestedOrder.suggestedQuantity} ${suggestedOrder.unit} - $0 (SUGGESTED)`;
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

  const handleRefreshSuggestions = () => {
    if (selectedProvider) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider) {
        const relevantStockItems = stockItems.filter(stock => 
          stock.associatedProviders.includes(selectedProvider) &&
          (stock.currentStock < stock.minimumQuantity || 
           (stock.nextOrder && new Date(stock.nextOrder) <= new Date()))
        );

        if (relevantStockItems.length > 0) {
          const suggestedText = relevantStockItems.map(stock => {
            const neededQuantity = stock.currentStock < stock.minimumQuantity 
              ? stock.minimumQuantity - stock.currentStock 
              : stock.quantity;
            
            const stockStatus = stock.currentStock < stock.minimumQuantity 
              ? `(LOW STOCK: ${stock.currentStock} ${stock.unit})`
              : `(RESTOCK DUE: ${new Date(stock.nextOrder!).toLocaleDateString()})`;
            
            return `${stock.productName}: ${neededQuantity} ${stock.unit} - $0 ${stockStatus}`;
          }).join('\n');

          setOrderText(suggestedText);
        }
      }
    }
  };

  const parseOrderText = (text: string): OrderItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: OrderItem[] = [];

    lines.forEach(line => {
      // Parse format: "Product: quantity unit - price (status)"
      const match = line.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s+(\w+)\s*-\s*\$?(\d+(?:\.\d+)?)/);
      if (match) {
        const [, productName, quantity, unit, price] = match;
        items.push({
          productName: productName.trim(),
          quantity: parseFloat(quantity),
          unit: unit.trim(),
          price: parseFloat(price),
          total: parseFloat(quantity) * parseFloat(price),
        });
      }
    });

    return items;
  };

  const handleSubmit = () => {
    if (!selectedProvider || !orderText.trim()) {
      return;
    }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Order
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
              Select Provider *
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a provider...</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.email}
                </option>
              ))}
            </select>
            
            {selectedProviderInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Provider Categories:</strong> {selectedProviderInfo.categories.join(', ')}
                </div>
                {selectedProviderInfo.notes && (
                  <div className="text-sm text-blue-700 mt-1">
                    <strong>Notes:</strong> {selectedProviderInfo.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items Text */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">Order Items</h3>
              <button
                onClick={handleRefreshSuggestions}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Suggestions
              </button>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Items (Format: Product: Quantity Unit - Price)
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Example: Bife de Chorizo: 7 kg - $8500
              </div>
            </div>

            <textarea
              value={orderText}
              onChange={(e) => setOrderText(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Select a provider to see suggested items..."
            />

            {/* Order Summary */}
            {orderText.trim() && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="space-y-2">
                  {parseOrderText(orderText).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.productName} - {item.quantity} {item.unit}
                      </span>
                                             <span>${item.total.toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                                         <span>${totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special instructions or delivery notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedProvider || !orderText.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
} 