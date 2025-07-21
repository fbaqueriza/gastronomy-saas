'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, Plus, Calendar } from 'lucide-react';
import { StockItem, Provider } from '../types';

interface SuggestedOrder {
  id: string;
  productName: string;
  category: string;
  suggestedQuantity: number;
  unit: string;
  reason: 'low_stock' | 'restock_due' | 'seasonal';
  urgency: 'high' | 'medium' | 'low';
  suggestedProviders: Provider[];
  estimatedCost: number;
  currency: string;
}

interface SuggestedOrdersProps {
  stockItems: StockItem[];
  providers: Provider[];
  onCreateOrder: (suggestedOrder: SuggestedOrder) => void;
}

export default function SuggestedOrders({
  stockItems,
  providers,
  onCreateOrder,
}: SuggestedOrdersProps) {
  
  const [selectedOrder, setSelectedOrder] = useState<SuggestedOrder | null>(null);

  // Generate suggested orders based on stock data
  const generateSuggestedOrders = (): SuggestedOrder[] => {
    const suggestions: SuggestedOrder[] = [];

    stockItems.forEach((item) => {
      // Check for low stock
      if (item.currentStock < item.minimumQuantity) {
        const neededQuantity = item.minimumQuantity - item.currentStock;
        const suggestedProviders = providers.filter((p) =>
          item.associatedProviders.includes(p.id),
        );

        if (suggestedProviders.length > 0) {
          suggestions.push({
            id: `low-stock-${item.id}`,
            productName: item.productName,
            category: item.category,
            suggestedQuantity: neededQuantity,
            unit: item.unit,
            reason: 'low_stock',
            urgency: 'high',
            suggestedProviders,
            estimatedCost: neededQuantity * 2.5, // Mock price
            currency: 'EUR',
          });
        }
      }

      // Check for restock due
      if (item.nextOrder && new Date(item.nextOrder) <= new Date()) {
        const suggestedProviders = providers.filter((p) =>
          item.associatedProviders.includes(p.id),
        );

        if (suggestedProviders.length > 0) {
          suggestions.push({
            id: `restock-${item.id}`,
            productName: item.productName,
            category: item.category,
            suggestedQuantity: item.quantity,
            unit: item.unit,
            reason: 'restock_due',
            urgency: 'medium',
            suggestedProviders,
            estimatedCost: item.quantity * 2.5, // Mock price
            currency: 'EUR',
          });
        }
      }
    });

    return suggestions.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  };

  const suggestedOrders = generateSuggestedOrders();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'restock_due':
        return <Clock className="h-4 w-4" />;
      case 'seasonal':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'low_stock':
        return 'Low Stock';
      case 'restock_due':
        return 'Restock Due';
      case 'seasonal':
        return 'Seasonal';
      default:
        return 'Unknown';
    }
  };

  if (suggestedOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Suggested Orders
        </h3>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No suggested orders at the moment</p>
          <p className="text-sm text-gray-400 mt-1">
            All items are well stocked and up to date
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Suggested Orders ({suggestedOrders.length})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Based on stock levels and restock schedules
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {suggestedOrders.map((order) => (
          <div key={order.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getReasonIcon(order.reason)}
                  <h4 className="font-medium text-gray-900">
                    {order.productName}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(
                      order.urgency,
                    )}`}
                  >
                    {order.urgency.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Category:</span> {order.category}
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>{' '}
                    {order.suggestedQuantity} {order.unit}
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span>{' '}
                    {getReasonText(order.reason)}
                  </div>
                  <div>
                    <span className="font-medium">Est. Cost:</span>{' '}
                    {order.estimatedCost} {order.currency}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Suggested Providers:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {order.suggestedProviders.map((provider) => (
                      <span
                        key={provider.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {provider.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <button
                  onClick={() => onCreateOrder(order)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 