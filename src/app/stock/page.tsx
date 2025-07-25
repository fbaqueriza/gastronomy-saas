'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
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
import { DataProvider, useData } from '../../components/DataProvider';
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
  const { stockItems, providers, orders, addStockItem, deleteStockItem } = useData();
  const isSeedUser = user?.email === 'test@test.com';

  // Remove minimumQuantity and currentStock columns
  const columns = [
    { key: 'productName', name: 'Producto', width: 180, editable: true, render: (value: any) => (
      <div style={{ wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: 170 }}>{value}</div>
    )},
    { key: 'category', name: 'Categoría', width: 150, editable: true },
    { key: 'quantity', name: 'Cantidad', width: 100, editable: true },
    { key: 'unit', name: 'Unidad', width: 100, editable: true },
    {
      key: 'restockFrequency',
      name: 'Frecuencia de reposición',
      width: 180,
      editable: true,
      render: (value: any, rowData: any, extra: { editing: boolean; setEditingValue: (v: any) => void; providers: any[]; editingCell?: any; setEditingCell?: any }) => {
        const freqMap: Record<string, string> = {
          daily: 'Diario',
          weekly: 'Semanal',
          monthly: 'Mensual',
          custom: 'Personalizado',
        };
        return freqMap[value] || value;
      },
    },
    {
      key: 'preferredProvider',
      name: 'Proveedor preferido',
      width: 200,
      editable: true,
      render: (value: any, rowData: any, extra: { providers: any[] }) => {
        const { providers } = extra;
        const [editing, setEditing] = React.useState(false);
        const [current, setCurrent] = React.useState(value);
        React.useEffect(() => { setCurrent(value); }, [value]);
        const getProviderById = (id: string) => providers.find((p: any) => p.id === id);
        const prov = getProviderById(current);
        const handleChange = (selected: string) => {
          setCurrent(selected);
          setEditing(false);
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('stock-edit', { detail: { id: rowData.id, key: 'preferredProvider', value: selected } });
            window.dispatchEvent(event);
          }
        };
        if (!editing) {
          if (prov) {
            return (
              <div className="w-full h-full" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
                <span
                  className="flex items-center bg-green-100 text-green-800 rounded px-2 py-0.5 text-sm font-medium"
                  title={prov.name}
                >
                  {prov.name}
                  <button
                    type="button"
                    className="ml-1 text-green-700 hover:text-red-600 focus:outline-none"
                    title="Quitar proveedor"
                    onClick={e => { e.stopPropagation(); handleChange(''); }}
                  >
                    ×
                  </button>
                </span>
              </div>
            );
          } else if (current && typeof current === 'string' && current.trim() !== '') {
            // Mostrar el valor real aunque no sea un ID válido
            return (
              <div className="w-full h-full" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
                <span
                  className="flex items-center bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 text-sm font-medium"
                  title="Valor no es un ID válido"
                >
                  {current}
                  <button
                    type="button"
                    className="ml-1 text-yellow-700 hover:text-red-900 focus:outline-none"
                    title="Quitar proveedor"
                    onClick={e => { e.stopPropagation(); handleChange(''); }}
                  >
                    ×
                  </button>
                </span>
              </div>
            );
          }
          return (
            <div className="w-full h-full" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
              <span className="text-gray-400 px-2 py-0.5 rounded">Sin preferido</span>
            </div>
          );
        }
        // editing
        return (
          <div className="relative z-10 w-full" tabIndex={0} onBlur={() => setEditing(false)}>
            <div className="border border-gray-400 bg-white rounded px-2 py-1 min-w-[8rem] shadow-lg">
              <div className="text-xs text-gray-500 mb-1">Seleccionar proveedor preferido:</div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {providers.map((prov: any) => (
                  <label key={prov.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`preferredProvider-${rowData.id}`}
                      checked={current === prov.id}
                      onChange={() => handleChange(prov.id)}
                    />
                    <span>{prov.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'associatedProviders',
      name: 'Proveedores asociados',
      width: 200,
      editable: true,
      render: (value: any, rowData: any, extra: { providers: any[] }) => {
        const { providers } = extra;
        const [editing, setEditing] = React.useState(false);
        const [current, setCurrent] = React.useState(Array.isArray(value) ? value : []);
        React.useEffect(() => { setCurrent(Array.isArray(value) ? value : []); }, [value]);
        const getProviderById = (id: string) => providers.find((p: any) => p.id === id);
        const handleChange = (selected: string[]) => {
          setCurrent(selected);
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('stock-edit', { detail: { id: rowData.id, key: 'associatedProviders', value: selected } });
            window.dispatchEvent(event);
          }
        };
        return (
          <div className="w-full h-full" onClick={() => setEditing(true)} style={{ cursor: editing ? 'default' : 'pointer', width: 200, minWidth: 200, maxWidth: 200 }}>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-1 mb-1">
                {(current.length === 0 && !editing) && (
                  <span className="text-gray-400 px-2 py-0.5 rounded">Sin proveedores</span>
                )}
                {current.map((provId: string) => {
                  const prov = getProviderById(provId);
                  if (prov) {
                    return (
                      <span
                        key={provId}
                        className="flex items-center rounded px-2 py-0.5 text-sm font-medium bg-green-100 text-green-800"
                        title={prov.name}
                      >
                        {prov.name}
                      </span>
                    );
                  } else if (provId && typeof provId === 'string' && provId.trim() !== '') {
                    // Mostrar el valor real aunque no sea un ID válido y permitir borrarlo
                    return (
                      <span
                        key={provId}
                        className="flex items-center rounded px-2 py-0.5 text-sm font-medium bg-yellow-100 text-yellow-800"
                        title="Valor no es un ID válido"
                      >
                        {provId}
                        <button
                          type="button"
                          className="ml-1 text-yellow-700 hover:text-red-900 focus:outline-none"
                          title="Quitar proveedor inválido"
                          onClick={e => {
                            e.stopPropagation();
                            const filtered = current.filter((n: string) => n !== provId);
                            handleChange(filtered);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              {editing && (
                <div className="relative z-10 w-full" tabIndex={0} onBlur={() => setEditing(false)}>
                  <div className="border border-gray-400 bg-white rounded px-2 py-1 min-w-[8rem] shadow-lg">
                    <div className="text-xs text-gray-500 mb-1">Seleccionar proveedores:</div>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {providers.map((prov: any) => (
                        <label key={prov.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={current.includes(prov.id)}
                            onChange={e => {
                              const selected = e.target.checked
                                ? [...current, prov.id]
                                : current.filter((n: string) => n !== prov.id);
                              handleChange(selected);
                            }}
                          />
                          <span>{prov.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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

  const handleDataChange = useCallback((newData: any[]) => {
    // @ts-ignore: TypeScript cannot guarantee discriminated union type from dynamic data, but runtime logic is safe
    // setStockItems(
    //   newData.reduce((acc: StockItem[], row) => {
    //     const rf = isRestockFrequency(row.restockFrequency)
    //       ? row.restockFrequency
    //       : 'weekly';
    //     let associatedProviders = Array.isArray(row.associatedProviders)
    //       ? row.associatedProviders
    //       : typeof row.associatedProviders === 'string'
    //       ? row.associatedProviders.split(',').map((p: string) => p.trim())
    //       : [];
    //     // Remove empty strings
    //     associatedProviders = associatedProviders.filter((name: string) => name);
    //     let preferredProvider = row.preferredProvider;
    //     if (preferredProvider && !associatedProviders.includes(preferredProvider)) {
    //       preferredProvider = '';
    //     }
    //     const item = {
    //       ...row,
    //       associatedProviders,
    //       preferredProvider,
    //       restockFrequency: rf,
    //       lastOrdered: row.lastOrdered ? new Date(row.lastOrdered) : undefined,
    //       nextOrder: row.nextOrder ? new Date(row.nextOrder) : undefined,
    //       updatedAt: new Date(),
    //     };
    //     if (isRestockFrequency(item.restockFrequency)) {
    //       acc.push(item as StockItem);
    //     }
    //     return acc;
    //   }, []) as StockItem[],
    // );
  }, []);

  const handleAddRow = useCallback(() => {
    if (!user) return;
    const newStockItem: StockItem = {
      id: Date.now().toString(),
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
      // Removed minimumQuantity and currentStock for type compatibility
    };
    // setStockItems([newStockItem, ...stockItems]); // This line was removed
  }, [stockItems, user]);

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
        setImportMessage('Faltan columnas requeridas: ' + missing.join(', '));
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
        const lastOrdered = row.lastOrdered && !isNaN(Date.parse(row.lastOrdered)) ? new Date(row.lastOrdered) : null;
        const nextOrder = row.nextOrder && !isNaN(Date.parse(row.nextOrder)) ? new Date(row.nextOrder) : null;
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
        const safeItems = importedStock.map(item => ({
          product_name: item.productName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          restock_frequency: item.restockFrequency,
          associated_providers: item.associatedProviders,
          preferred_provider: item.preferredProvider,
          last_ordered: item.lastOrdered,
          next_order: item.nextOrder,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          user_id: user.id,
        }));
        if (safeItems.length > 0) {
          await addStockItem(safeItems, user.id, true); // batch insert
          successCount = safeItems.length;
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
      } else {
        setImportMessage(`Importación completada con ${successCount} éxitos y ${errorCount} errores. Revisa la consola para detalles.`);
      }
    };
    reader.readAsText(file);
  }, [addStockItem, providers, user]);

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

  useEffect(() => {
    function handleStockEdit(e: any) {
      const { id, key, value } = e.detail;
      // setStockItems(prev => prev.map(item => item.id === id ? { ...item, [key]: value } : item)); // This line was removed
    }
    window.addEventListener('stock-edit', handleStockEdit);
    return () => window.removeEventListener('stock-edit', handleStockEdit);
  }, []);

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
                {es.stock.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {es.stock.description}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Removed add button */}
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
                        {es.stock.totalItems}
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
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {es.stock.expiresThisWeek}
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
            data={stockWithDates.map(row => ({ ...row, providers }))}
            onDataChange={handleDataChange}
            onAddRow={handleAddRow}
            onDeleteRows={handleDeleteRows}
            onExport={handleExport}
            onImport={handleImport}
            searchable={true}
            selectable={true}
            loading={loading} // Loading state is handled by DataProvider
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
                  {es.stock.managementTips}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>{es.stock.setMinQuantities}</li>
                    <li>{es.stock.updateStockLevels}</li>
                    <li>
                      {es.stock.associateProducts}
                    </li>
                    <li>{es.stock.useRestockFrequency}</li>
                    <li>{es.stock.exportData}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {importMessage && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded shadow">
          {importMessage}
        </div>
      )}
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
