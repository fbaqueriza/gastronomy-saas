'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../components/AuthProvider';
import Navigation from '../../components/Navigation';
import SpreadsheetGrid from '../../components/DataGrid';
import { StockItem } from '../../types';
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export default function StockPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  // Add a mock providers array for name lookup
  const providers = [
    { id: '1', name: 'Fresh Foods Inc.' },
    { id: '2', name: 'Organic Valley Co.' },
  ];
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: '1',
      productName: 'Tomatoes',
      category: 'Produce',
      quantity: 50,
      unit: 'kg',
      restockFrequency: 'weekly',
      minimumQuantity: 10,
      currentStock: 15,
      associatedProviders: ['1', '2'],
      preferredProvider: '1',
      lastOrdered: new Date('2024-01-15'),
      nextOrder: new Date('2024-01-22'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      productName: 'Milk',
      category: 'Dairy',
      quantity: 100,
      unit: 'L',
      restockFrequency: 'daily',
      minimumQuantity: 20,
      currentStock: 25,
      associatedProviders: ['2'],
      preferredProvider: '2',
      lastOrdered: new Date('2024-01-20'),
      nextOrder: new Date('2024-01-21'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      productName: 'Cheese',
      category: 'Dairy',
      quantity: 30,
      unit: 'kg',
      restockFrequency: 'monthly',
      minimumQuantity: 5,
      currentStock: 3,
      associatedProviders: ['2'],
      preferredProvider: '2',
      lastOrdered: new Date('2024-01-10'),
      nextOrder: new Date('2024-02-10'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: 'productName',
      name: t('stock.productName'),
      width: 200,
      editable: true,
    },
    { key: 'category', name: t('stock.category'), width: 150, editable: true },
    { key: 'quantity', name: t('common.quantity'), width: 100, editable: true },
    { key: 'unit', name: t('common.unit'), width: 80, editable: true },
    {
      key: 'restockFrequency',
      name: t('stock.restockFrequency'),
      width: 120,
      editable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'associatedProviders',
      name: t('stock.associatedProviders'),
      width: 200,
      editable: true,
      render: (value: string[], _row: any) => {
        if (!Array.isArray(value)) {return '';}
        return value
          .map((id) => {
            const provider = providers.find((p) => p.id === id);
            return provider ? provider.name : id;
          })
          .join(', ');
      },
    },
    {
      key: 'preferredProvider',
      name: t('stock.preferredProvider'),
      width: 200,
      editable: true,
      render: (value: string, _row: any) => {
        const provider = providers.find((p) => p.id === value);
        return provider ? provider.name : value;
      },
    },
    {
      key: 'lastOrdered',
      name: t('stock.lastOrdered'),
      width: 120,
      editable: true,
      render: (value: Date) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      key: 'nextOrder',
      name: t('stock.nextOrder'),
      width: 120,
      editable: true,
      render: (value: Date) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      key: 'status',
      name: t('common.status'),
      width: 100,
      editable: false,
      render: (_: any, row: StockItem) => {
        if (!row) {return null;}
        const currentStock = row.currentStock || 0;
        const minimumQuantity = row.minimumQuantity || 0;
        if (currentStock <= minimumQuantity) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low
            </span>
          );
        } else if (currentStock <= minimumQuantity * 1.5) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Medium
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Good
            </span>
          );
        }
      },
    },
    {
      key: 'minimumQuantity',
      name: t('stock.minimumQuantity'),
      width: 120,
      editable: true,
    },
    {
      key: 'currentStock',
      name: t('stock.currentStock'),
      width: 120,
      editable: true,
    },
  ];

  const allowedRestockFrequencies = [
    'daily',
    'weekly',
    'monthly',
    'custom',
  ] as const;
  type RestockFrequency = (typeof allowedRestockFrequencies)[number];
  function isRestockFrequency(val: any): val is RestockFrequency {
    return allowedRestockFrequencies.includes(val);
  }

  const handleDataChange = useCallback((newData: any[]) => {
    // @ts-ignore: TypeScript cannot guarantee discriminated union type from dynamic data, but runtime logic is safe
    setStockItems(
      newData.reduce((acc: StockItem[], row) => {
        const rf = isRestockFrequency(row.restockFrequency)
          ? row.restockFrequency
          : 'weekly';
        const item = {
          ...row,
          associatedProviders:
            typeof row.associatedProviders === 'string'
              ? row.associatedProviders.split(',').map((p: string) => p.trim())
              : row.associatedProviders || [],
          restockFrequency: rf,
          lastOrdered: row.lastOrdered ? new Date(row.lastOrdered) : undefined,
          nextOrder: row.nextOrder ? new Date(row.nextOrder) : undefined,
          updatedAt: new Date(),
        };
        if (isRestockFrequency(item.restockFrequency)) {
          acc.push(item as StockItem);
        }
        return acc;
      }, []) as StockItem[],
    );
  }, []);

  const handleAddRow = useCallback(() => {
    const newStockItem: StockItem = {
      id: Date.now().toString(),
      productName: '',
      category: 'Other', // Default category for new items
      quantity: 0,
      unit: '',
      restockFrequency: 'weekly',
      minimumQuantity: 0,
      currentStock: 0,
      associatedProviders: [],
      preferredProvider: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setStockItems([...stockItems, newStockItem]);
  }, [stockItems]);

  const handleDeleteRows = useCallback(
    (rowsToDelete: any[]) => {
      const idsToDelete = rowsToDelete.map((row) => row.id);
      setStockItems(
        stockItems.filter((item) => !idsToDelete.includes(item.id)),
      );
    },
    [stockItems],
  );

  const handleExport = useCallback(() => {
    // Convert data to CSV format
    const csvContent = [
      columns.map((col) => col.name).join(','),
      ...stockItems.map((item) =>
        [
          item.productName,
          item.category, // Add category to CSV
          item.quantity,
          item.unit,
          item.restockFrequency,
          item.minimumQuantity,
          item.currentStock,
          item.associatedProviders.join(';'),
          item.preferredProvider,
          item.lastOrdered
            ? new Date(item.lastOrdered).toLocaleDateString()
            : '',
          item.nextOrder ? new Date(item.nextOrder).toLocaleDateString() : '',
        ].join(','),
      ),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock-items.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [stockItems, columns]);

  const handleImport = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');

        const importedItems = lines.slice(1).map((line, index) => {
          const values = line.split(',');
          const rf = isRestockFrequency(values[4]) ? values[4] : 'weekly';
          return {
            id: (Date.now() + index).toString(),
            productName: values[0] || '',
            category: values[1] || 'Other', // Default category for imported items
            quantity: parseInt(values[2]) || 0,
            unit: values[3] || '',
            restockFrequency: rf,
            minimumQuantity: parseInt(values[5]) || 0,
            currentStock: parseInt(values[6]) || 0,
            associatedProviders: values[7]
              ? values[7].split(';').map((p) => p.trim())
              : [],
            preferredProvider: values[8] || '',
            lastOrdered: values[9] ? new Date(values[9]) : undefined,
            nextOrder: values[10] ? new Date(values[10]) : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as StockItem;
        });

        setStockItems([...stockItems, ...importedItems]);
      };
      reader.readAsText(file);
    },
    [stockItems],
  );

  const lowStockItems = stockItems.filter(
    (item) => (item.currentStock || 0) <= (item.minimumQuantity || 0),
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
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
                {t('stock.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track stock needs and manage inventory levels
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {lowStockItems.length > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {lowStockItems.length} {t('stock.lowStockAlert')}
                  </span>
                </div>
              )}

              <button
                onClick={handleAddRow}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('stock.addItem')}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Items
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stockItems.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Low Stock Items
                      </dt>
                      <dd className="text-lg font-medium text-red-600">
                        {lowStockItems.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Due This Week
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {
                          stockItems.filter((item) => {
                            if (!item.nextOrder) {return false;}
                            const nextOrder = new Date(item.nextOrder);
                            const weekFromNow = new Date();
                            weekFromNow.setDate(weekFromNow.getDate() + 7);
                            return nextOrder <= weekFromNow;
                          }).length
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="px-4 sm:px-0">
          <SpreadsheetGrid
            columns={columns}
            data={stockItems}
            onDataChange={handleDataChange}
            onAddRow={handleAddRow}
            onDeleteRows={handleDeleteRows}
            onExport={handleExport}
            onImport={handleImport}
            searchable={true}
            selectable={true}
            loading={loading}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Stock Management Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Set minimum quantities to trigger low stock alerts</li>
                    <li>Update current stock levels regularly</li>
                    <li>
                      Link products to multiple providers for backup options
                    </li>
                    <li>Use restock frequency to plan ordering schedules</li>
                    <li>Export data to generate order lists for providers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
