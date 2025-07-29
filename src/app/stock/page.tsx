'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import SpreadsheetGrid from '../../components/DataGrid';
import { StockItem } from '../../types';
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Upload,
} from 'lucide-react';
import { DataProvider, useData } from '../../components/DataProvider';
import IntegratedChatPanel from '../../components/IntegratedChatPanel';
import { useChat } from '../../contexts/ChatContext';
import es from '../../locales/es';
import { useRouter } from 'next/navigation';

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getRestockDays(frequency: string) {
  switch (frequency) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'monthly': return 30;
    default: return 7;
  }
}

export default function StockPageWrapper() {
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
      {user && <StockPage user={user} />}
    </DataProvider>
  );
}

type StockPageProps = { user: any };
function StockPage({ user }: StockPageProps) {
  // user y authLoading ya están definidos arriba
  const { stockItems, providers, orders, addStockItem, deleteStockItem, updateStockItem, setStockItems, fetchAll } = useData();
  const [data, setData] = useState(stockItems);
  const isSeedUser = user?.email === 'test@test.com';

  const [editingModal, setEditingModal] = useState<{
    isOpen: boolean;
    type: 'frequency' | 'preferred' | 'associated';
    rowData: any;
    currentValue: any;
  } | null>(null);
  
  // Chat state
  const { openChat, isChatOpen } = useChat();
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  // Sincronizar el estado local con el contexto
  useEffect(() => {
    if (isChatOpen !== isChatPanelOpen) {
      setIsChatPanelOpen(isChatOpen);
    }
  }, [isChatOpen, isChatPanelOpen]);

  // Remove minimumQuantity and currentStock columns
  const columns = [
    { key: 'productName', name: 'Producto', width: 180, editable: true },
    { key: 'category', name: 'Categoría', width: 150, editable: true },
    { key: 'quantity', name: 'Cantidad', width: 100, editable: true },
    { key: 'unit', name: 'Unidad', width: 100, editable: true },
    {
      key: 'restockFrequency',
      name: 'Frecuencia de reposición',
      width: 180,
      editable: false,
      render: (value: any, rowData: any) => {
        const options = [
          { value: 'daily', label: 'Diario' },
          { value: 'weekly', label: 'Semanal' },
          { value: 'monthly', label: 'Mensual' },
        ];
        
        const getLabel = (val: string) => {
          const option = options.find(opt => opt.value === val);
          return option ? option.label : val;
        };
        
        return (
          <div 
            className="px-2 py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              setEditingModal({
                isOpen: true,
                type: 'frequency',
                rowData,
                currentValue: value || 'weekly'
              });
            }}
          >
            {getLabel(value || 'weekly')}
          </div>
        );
      },
    },
    {
      key: 'preferredProvider',
      name: 'Proveedor preferido',
      width: 200,
      editable: false,
      render: (value: any, rowData: any) => {
        const availableProviders = providers || [];
        if (!availableProviders || availableProviders.length === 0) {
          return <span className="text-gray-400">Sin proveedores disponibles</span>;
        }
        
        const getProviderById = (id: string) => availableProviders.find((p: any) => p.id === id);
        const prov = getProviderById(value);
        
        return (
          <div 
            className="px-2 py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              setEditingModal({
                isOpen: true,
                type: 'preferred',
                rowData,
                currentValue: value || ''
              });
            }}
          >
            {prov ? (
              <span className="flex items-center bg-green-100 text-green-800 rounded px-2 py-0.5 text-sm font-medium">
                {prov.name}
              </span>
            ) : (
              <span className="text-gray-400">Sin preferido</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'associatedProviders',
      name: 'Proveedores asociados',
      width: 200,
      editable: false,
      render: (value: any, rowData: any) => {
        const availableProviders = providers || [];
        const associatedProviders = Array.isArray(value) ? value : [];
        
        const selectedProviders = associatedProviders
          .map(providerId => availableProviders.find((p: any) => p.id === providerId))
          .filter(Boolean);
        
        return (
          <div 
            className="px-2 py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              setEditingModal({
                isOpen: true,
                type: 'associated',
                rowData,
                currentValue: associatedProviders
              });
            }}
          >
            {selectedProviders.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedProviders.map((provider: any) => (
                  <span key={provider.id} className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs font-medium">
                    {provider.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">Sin proveedores</span>
            )}
          </div>
        );
      },
    },
    { key: 'lastOrdered', name: 'Última orden', width: 150, editable: false },
    { key: 'nextOrder', name: 'Próxima orden', width: 150, editable: false },
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

  const handleDataChange = useCallback(async (newData: any[]) => {
    console.log('handleDataChange called with:', newData);
    
    // Encontrar solo los items que realmente cambiaron
    const changedItems = newData.filter((newItem, index) => {
      const originalItem = stockItems[index];
      if (!originalItem) return false;
      
      // Comparar solo los campos editables
      return (
        newItem.productName !== originalItem.productName ||
        newItem.category !== originalItem.category ||
        newItem.quantity !== originalItem.quantity ||
        newItem.unit !== originalItem.unit ||
        newItem.restockFrequency !== originalItem.restockFrequency ||
        newItem.preferredProvider !== originalItem.preferredProvider ||
        JSON.stringify(newItem.associatedProviders) !== JSON.stringify(originalItem.associatedProviders)
      );
    });
    
    console.log('🔄 Items con cambios detectados:', changedItems.length);
    
    // Actualizar solo los items modificados
    for (const changedItem of changedItems) {
      try {
        // Preservar datos existentes que no se editaron
        const originalItem = stockItems.find(item => item.id === changedItem.id);
        if (originalItem) {
          // Validaciones mejoradas
          const updatedItem = {
            ...originalItem,
            ...changedItem,
            // Validar y convertir quantity
            quantity: changedItem.quantity === '' || changedItem.quantity === null || changedItem.quantity === undefined 
              ? 0 
              : Number(changedItem.quantity),
            // Asegurar que los arrays se mantengan como arrays
            associatedProviders: Array.isArray(changedItem.associatedProviders) 
              ? changedItem.associatedProviders 
              : originalItem.associatedProviders || [],
            // Validar fechas
            lastOrdered: changedItem.lastOrdered && !isNaN(Date.parse(String(changedItem.lastOrdered))) 
              ? new Date(changedItem.lastOrdered) 
              : originalItem.lastOrdered,
            nextOrder: changedItem.nextOrder && !isNaN(Date.parse(String(changedItem.nextOrder))) 
              ? new Date(changedItem.nextOrder) 
              : originalItem.nextOrder,
          };
          
          console.log('📝 Actualizando item:', updatedItem.id, updatedItem.productName);
          await updateStockItem(updatedItem);
        }
      } catch (error) {
        console.error('Error updating stock item:', changedItem.id, error);
      }
    }
  }, [updateStockItem, stockItems]);

  const [addingStockItem, setAddingStockItem] = useState(false);

  const handleAddRow = useCallback(() => {
    if (!user || addingStockItem) {
      console.error('No user available for adding stock item or already adding');
      return;
    }
    
    setAddingStockItem(true);
    console.log('Adding new stock item for user:', user.id);
    const newStockItem: Partial<StockItem> = {
      user_id: user.id,
      productName: '',
      category: 'Other',
      quantity: 0,
      unit: '',
      restockFrequency: 'weekly',
      associatedProviders: [],
      preferredProvider: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Forzar actualización inmediata del estado
    addStockItem(newStockItem, user.id).then(() => {
      console.log('Stock item added successfully');
      setAddingStockItem(false);
      // Forzar re-render del DataGrid
      setTimeout(() => {
        fetchAll();
      }, 100);
    }).catch(error => {
      console.error('Error adding stock item:', error);
      setAddingStockItem(false);
    });
  }, [addStockItem, user, addingStockItem, fetchAll]);

  const handleDeleteRows = useCallback(
    async (rowsToDelete: any[]) => {
      if (!rowsToDelete || rowsToDelete.length === 0) return;
      setLoading(true);
      try {
        const ids = rowsToDelete.map(row => row.id);
        await deleteStockItem(ids, user.id, true); // batch delete
      } catch (err) {
        console.error('Error deleting stock items:', rowsToDelete, err);
      }
      setLoading(false);
    },
    [deleteStockItem, user]
  );

  const handleExport = useCallback(() => {
    const headers = [
      'Producto',
      'Categoría',
      'Cantidad',
      'Unidad',
      'Frecuencia de reposición',
      'Proveedores asociados',
      'Proveedor preferido',
      'Última orden',
      'Próxima orden',
    ];
    const csvContent = [
      headers.join(','),
      ...stockItems.map((item) =>
        [
          item.productName ?? '',
          item.category ?? '',
          item.quantity ?? '',
          item.unit ?? '',
          item.restockFrequency ?? '',
          (item.associatedProviders ?? []).join(';'),
          item.preferredProvider ?? '',
          item.lastOrdered ? new Date(item.lastOrdered).toLocaleDateString() : '',
          item.nextOrder ? new Date(item.nextOrder).toLocaleDateString() : '',
        ].map(v => `"${String(v).replace(/"/g, '""')}` ).join(',')
      ),
    ].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [stockItems]);

  const handleDownloadTemplate = useCallback(() => {
    const templateContent = `productName,category,quantity,unit,restockFrequency,associatedProviders,preferredProvider,lastOrdered,nextOrder
Harina de trigo,Harinas,50,kg,weekly,Proveedor A;Proveedor B,Proveedor A,2025-07-20,2025-07-27
Aceite de oliva,Aceites,20,lt,monthly,Proveedor C,Proveedor C,2025-07-15,2025-08-15
Sal fina,Especias,100,kg,daily,Proveedor A,Proveedor A,2025-07-25,2025-07-26
Azúcar blanca,Endulzantes,75,kg,weekly,Proveedor B,Proveedor B,2025-07-18,2025-07-25
Huevos,Proteínas,200,unidades,daily,Proveedor D,Proveedor D,2025-07-25,2025-07-26`;
    
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const [loading, setLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // Update handleImport to persist to Supabase
  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) {
        setImportMessage('El archivo CSV está vacío o no tiene datos.');
        return;
      }
      // Limpiar BOM y parsear headers con parseCsvRow
      let rawHeaders = parseCsvRow(lines[0]);
      if (rawHeaders[0].charCodeAt(0) === 0xFEFF) {
        rawHeaders[0] = rawHeaders[0].slice(1);
      }
      // Normalizar headers (igual que en proveedores)
      const normalizeHeader = (str: string) => str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
      const headerMap: Record<string, string> = {
        'producto': 'productName',
        'productname': 'productName',
        'product_name': 'productName',
        'categoria': 'category',
        'categoría': 'category',
        'category': 'category',
        'cantidad': 'quantity',
        'quantity': 'quantity',
        'unidad': 'unit',
        'unit': 'unit',
        'frecuenciadereposicion': 'restockFrequency',
        'frecuenciadereposición': 'restockFrequency',
        'restockfrequency': 'restockFrequency',
        'restock_frequency': 'restockFrequency',
        'frecuencia': 'restockFrequency',
        'frecuenciaderepocicion': 'restockFrequency',
        'frecuenciareposicion': 'restockFrequency',
        'proveedoresasociados': 'associatedProviders',
        'associatedproviders': 'associatedProviders',
        'associated_providers': 'associatedProviders',
        'proveedorpreferido': 'preferredProvider',
        'proveedorpreferído': 'preferredProvider',
        'preferredprovider': 'preferredProvider',
        'preferred_provider': 'preferredProvider',
        'ultimaorden': 'lastOrdered',
        'últimaorden': 'lastOrdered',
        'lastordered': 'lastOrdered',
        'proximaorden': 'nextOrder',
        'próximaorden': 'nextOrder',
        'nextorder': 'nextOrder',
        'createdat': 'createdAt',
        'created_at': 'createdAt',
        'updatedat': 'updatedAt',
        'updated_at': 'updatedAt',
      };
      const normalizedRawHeaders = rawHeaders.map(h => normalizeHeader(h));
      const headers = normalizedRawHeaders.map(h => headerMap[h] || h);
      console.log('HEADERS:', headers);
      const required = ['productName', 'category', 'quantity', 'unit', 'restockFrequency'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) {
        setImportMessage(`Faltan columnas requeridas: ${missing.join(', ')}. El archivo debe contener las columnas: productName, category, quantity, unit, restockFrequency. Puedes descargar la plantilla desde el botón "Descargar plantilla" para ver el formato correcto.`);
        return;
      }
      const importedStock = lines.slice(1).map(line => {
        const values = parseCsvRow(line);
        const row: any = {};
        headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
        console.log('ROW:', row);
        let associatedProviders: string[] = [];
        if (row.associatedProviders && typeof row.associatedProviders === 'string') {
          associatedProviders = row.associatedProviders.split(';').map((p: string) => p.trim()).filter(Boolean);
        }
        const providerNameToId = (name: string) => {
          if (!name) return '';
          const prov = providers?.find((p: any) => p.name?.toLowerCase().trim() === name.toLowerCase().trim());
          return prov ? prov.id : name;
        };
        associatedProviders = associatedProviders.map(providerNameToId);
        let preferredProvider = row.preferredProvider ? row.preferredProvider.trim() : '';
        preferredProvider = providerNameToId(preferredProvider);
        const lastOrdered = row.lastOrdered && !isNaN(Date.parse(row.lastOrdered)) ? new Date(row.lastOrdered) : undefined;
        const nextOrder = row.nextOrder && !isNaN(Date.parse(row.nextOrder)) ? new Date(row.nextOrder) : undefined;
        const quantity = row.quantity && !isNaN(Number(row.quantity)) ? Number(row.quantity) : 0;
        const freqMap: Record<string, string> = {
          'diario': 'daily',
          'semanal': 'weekly',
          'mensual': 'monthly',
          'personalizado': 'custom',
        };
        let restockFrequency = row.restockFrequency?.toLowerCase();
        restockFrequency = freqMap[restockFrequency] || restockFrequency;
        const allowedFrequencies = ['daily','weekly','monthly','custom'];
        const finalRestockFrequency = allowedFrequencies.includes(restockFrequency) ? restockFrequency : '';
        return {
          productName: row.productName || '',
          category: row.category || '',
          quantity,
          unit: row.unit || '',
          restockFrequency: finalRestockFrequency,
          associatedProviders,
          preferredProvider,
          lastOrdered,
          nextOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
      .filter(item => item.productName && item.productName.trim() !== ''); // Solo importar si tiene productName
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;
      try {
        if (importedStock.length > 0) {
          await addStockItem(importedStock, user.id, true); // batch insert
          successCount = importedStock.length;
        }
      } catch (err: any) {
        errorCount = importedStock.length;
        console.error('Error importing stock batch:', err);
        let errorMsg = 'Error desconocido';
        if (err && (err.message || err.details)) {
          errorMsg = err.message || err.details;
        } else if (typeof err === 'string') {
          errorMsg = err;
        } else if (err && err.toString) {
          errorMsg = err.toString();
        }
        console.error('Error importing stock batch:', errorMsg);
        setImportMessage(`Error al importar productos. Detalle: ${errorMsg}`);
      }
      setLoading(false);
      if (errorCount === 0) {
        setImportMessage(`¡Importación exitosa! Se importaron ${successCount} productos de stock.`);
        // Actualizar los datos después de la importación exitosa
        setTimeout(() => {
          fetchAll();
        }, 500);
      } else {
        setImportMessage(`Importación completada con ${successCount} éxitos y ${errorCount} errores. Revisa la consola para detalles.`);
      }
    };
    reader.readAsText(file);
  }, [addStockItem, providers, user, fetchAll]);

  // Remove lowStockItems and quick stats that depend on removed columns

  // Dynamically calculate lastOrdered and nextOrder for each stock item
  const stockWithDates = stockItems.map((item) => {
    // Find all completed orders for this item
    const completedOrders = orders.filter((order) =>
      (order.status === 'confirmed' || order.status === 'delivered') &&
      order.items.some((orderItem) => orderItem.productName === item.productName)
    );
    let lastOrdered: Date | undefined = undefined;
    if (completedOrders.length > 0) {
      lastOrdered = new Date(Math.max(...completedOrders.map((o) => new Date(o.orderDate).getTime())));
    }
    // Calculate nextOrder
    let nextOrder: Date | undefined = undefined;
    if (lastOrdered) {
      nextOrder = addDays(lastOrdered, getRestockDays(item.restockFrequency));
    }
    return {
      ...item,
      lastOrdered,
      nextOrder,
    };
  });

  // Add a migration useEffect to convert provider names to IDs in stockItems
  useEffect(() => {
    if (!providers || providers.length === 0) return;
    let changed = false;
    // Normaliza para comparar
    const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    const migrated = stockItems.map(item => {
      // Migrate associatedProviders: if value is an ID, replace with provider name
      let newAssociated = Array.isArray(item.associatedProviders) ? item.associatedProviders.map(val => {
        // If it's a name, keep it
        if (providers.some(p => normalize(p.name) === normalize(val || ''))) return val;
        // If it's an ID, find the provider and use its name
        const found = providers.find(p => String(p.id) === String(val));
        if (found) { changed = true; return found.name; }
        return val;
      }) : [];
      newAssociated = Array.from(new Set(newAssociated));
      // Migrate preferredProvider
      let newPreferred = item.preferredProvider;
      if (newPreferred && !providers.some(p => normalize(p.name) === normalize(newPreferred || ''))) {
        const found = providers.find(p => String(p.id) === String(newPreferred));
        if (found) { changed = true; newPreferred = found.name; }
      }
      return { ...item, associatedProviders: newAssociated, preferredProvider: newPreferred };
    });
    // setStockItems(migrated); // This line was removed
  }, [providers]);

  // MIGRACIÓN: Al cargar stockItems o providers, convierte nombres a IDs
  React.useEffect(() => {
    if (!providers || providers.length === 0 || !stockItems || stockItems.length === 0) return;
    let changed = false;
    const getIdByName = (name: string) => {
      const prov = providers.find(p => p.name === name);
      return prov ? prov.id : name;
    };
    const migrated = stockItems.map(item => {
      let newAssociated = Array.isArray(item.associatedProviders)
        ? item.associatedProviders.map(val => providers.some(p => p.id === val) ? val : getIdByName(val))
        : [];
      newAssociated = Array.from(new Set(newAssociated));
      let newPreferred = item.preferredProvider;
      if (newPreferred && !providers.some(p => p.id === newPreferred)) {
        newPreferred = getIdByName(newPreferred);
      }
      if (
        JSON.stringify(newAssociated) !== JSON.stringify(item.associatedProviders) ||
        newPreferred !== item.preferredProvider
      ) {
        changed = true;
        return { ...item, associatedProviders: newAssociated, preferredProvider: newPreferred };
      }
      return item;
    });
    // setStockItems(migrated); // This line was removed
  }, [providers, stockItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__GLOBAL_PROVIDERS__ = providers;
    }
  }, [providers]);



  if (!user) {
    return null; // Will redirect to login
  }

  // Removed the blocking check for providers - allow stock page to load even without providers

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
                  <p className="text-sm text-gray-500">
                    Administra tu inventario y proveedores
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {/* Botones removidos - solo se usan desde SpreadsheetGrid */}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>¿Necesitas agregar muchos productos?</strong> Usa "Exportar" para descargar la planilla, 
                completa tus datos y luego "Importar" para cargarlos de manera masiva.
              </p>
            </div>
            <SpreadsheetGrid
              columns={columns}
              data={stockItems}
              onDataChange={handleDataChange}
              onExport={handleExport}
              onImport={handleImport}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {editingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingModal.type === 'frequency' && 'Editar Frecuencia de Reposición'}
              {editingModal.type === 'preferred' && 'Editar Proveedor Preferido'}
              {editingModal.type === 'associated' && 'Editar Proveedores Asociados'}
            </h3>
            
            {editingModal.type === 'frequency' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de reposición
                </label>
                <select
                  value={editingModal.currentValue}
                  onChange={(e) => {
                    const newData = stockItems.map((item: any) => 
                      item.id === editingModal.rowData.id 
                        ? { ...item, restockFrequency: e.target.value }
                        : item
                    );
                    handleDataChange(newData);
                    setEditingModal(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            )}

            {editingModal.type === 'preferred' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor preferido
                </label>
                <select
                  value={editingModal.currentValue}
                  onChange={(e) => {
                    const newData = stockItems.map((item: any) => 
                      item.id === editingModal.rowData.id 
                        ? { ...item, preferredProvider: e.target.value }
                        : item
                    );
                    handleDataChange(newData);
                    setEditingModal(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin preferido</option>
                  {providers.map((provider: any) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editingModal.type === 'associated' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedores asociados
                </label>
                <select
                  multiple
                  value={editingModal.currentValue}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    const newData = stockItems.map((item: any) => 
                      item.id === editingModal.rowData.id 
                        ? { ...item, associatedProviders: selectedOptions }
                        : item
                    );
                    handleDataChange(newData);
                    setEditingModal(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size={Math.min(providers.length, 8)}
                >
                  {providers.map((provider: any) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Mantén Ctrl (Cmd en Mac) para seleccionar múltiples
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Integrado */}
      <IntegratedChatPanel
        providers={providers}
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
      />
      
      {/* Botón flotante del chat */}
      {/* ChatFloatingButton
        onToggleChat={() => setIsChatPanelOpen(!isChatPanelOpen)}
        isChatOpen={isChatPanelOpen}
      /> */}
    </div>
  );
}

// Función robusta para parsear filas CSV (ya existe en el archivo, reutilizar)
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
