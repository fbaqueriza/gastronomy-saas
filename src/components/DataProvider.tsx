import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, Provider, StockItem, WhatsAppMessage } from '../types';
import supabase from '../lib/supabaseClient';

interface DataContextType {
  orders: Order[];
  providers: Provider[];
  stockItems: StockItem[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  addOrder: (order: Partial<Order>, user_id: string) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string, user_id: string) => Promise<void>;
  addProvider: (provider: Partial<Provider> | Partial<Provider>[], user_id: string, batch?: boolean) => Promise<any>;
  updateProvider: (provider: Provider) => Promise<void>;
  deleteProvider: (id: string | string[], user_id: string, batch?: boolean, forceDelete?: boolean) => Promise<void>;
  addStockItem: (item: Partial<StockItem> | Partial<StockItem>[], user_id: string, batch?: boolean) => Promise<void>;
  updateStockItem: (item: StockItem) => Promise<void>;
  deleteStockItem: (id: string | string[], user_id: string, batch?: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

// Función para mapear de snake_case a camelCase
function mapStockItemFromDb(item: any): StockItem {
  return {
    ...item,
    productName: item.product_name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    restockFrequency: item.restock_frequency,
    associatedProviders: item.associated_providers,
    preferredProvider: item.preferred_provider,
    lastOrdered: item.last_ordered,
    nextOrder: item.next_order,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    id: item.id,
    user_id: item.user_id,
  };
}

// Función para mapear Order de snake_case a camelCase
function mapOrderFromDb(order: any): Order {
  return {
    ...order,
    providerId: order.provider_id,
    totalAmount: order.total_amount,
    orderDate: order.order_date,
    dueDate: order.due_date,
    invoiceNumber: order.invoice_number,
    bankInfo: order.bank_info,
    receiptUrl: order.receipt_url,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    id: order.id,
    user_id: order.user_id,
  };
}

// Función para mapear Provider de snake_case a camelCase
function mapProviderFromDb(provider: any): Provider {
  return {
    ...provider,
    contactName: provider.contact_name,
    razonSocial: provider.razon_social,
    cuitCuil: provider.cuit_cuil,
    createdAt: provider.created_at,
    updatedAt: provider.updated_at,
    id: provider.id,
    user_id: provider.user_id,
  };
}

export const DataProvider: React.FC<{ userEmail?: string; userId?: string; children: React.ReactNode }> = ({ userEmail, userId, children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);

  // Fetch user_id from email if not provided
  useEffect(() => {
    if (!userEmail && !userId) return;
    if (userId) {
      setCurrentUserId(userId);
      return;
    }
    const fetchUserId = async () => {
      try {
        const { data: userData, error: userError, status } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .single();
        if (!userError && userData) {
          setCurrentUserId(userData.id);
        } else if (status === 406 || (userError && userError.code === 'PGRST116')) {
          // 406 Not Acceptable or not found: create user row
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{ email: userEmail }])
            .select('id')
            .single();
          if (!createError && newUser) {
            setCurrentUserId(newUser.id);
          } else {
            setCurrentUserId(null);
            setLoading(false);
            setErrorMsg('No se pudo crear el usuario en la base de datos.');
          }
        } else {
          setCurrentUserId(null);
          setLoading(false);
          setErrorMsg('Error al buscar el usuario en la base de datos.');
        }
      } catch (err) {
        setCurrentUserId(null);
        setLoading(false);
        setErrorMsg('Error inesperado al buscar/crear usuario.');
      }
    };
    fetchUserId();
  }, [userEmail, userId]);

  // Error state for user fetch/creation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all data for the user
  const fetchAll = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    const [{ data: provs }, { data: ords }, { data: stocks }] = await Promise.all([
      supabase.from('providers').select('*').eq('user_id', currentUserId),
      supabase.from('orders').select('*').eq('user_id', currentUserId),
      supabase.from('stock').select('*').eq('user_id', currentUserId),
    ]);
    setProviders((provs || []).map(mapProviderFromDb));
    setOrders((ords || []).map(mapOrderFromDb));
    setStockItems((stocks || []).map(mapStockItemFromDb));
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) fetchAll();
  }, [currentUserId, fetchAll]);

  // CRUD: Orders
  const addOrder = useCallback(async (order: Partial<Order>, user_id: string) => {
    // Mapear campos a snake_case
    const snakeCaseOrder = {
      provider_id: (order as any).providerId,
      user_id,
      items: order.items,
      status: order.status,
      total_amount: (order as any).totalAmount,
      currency: order.currency,
      order_date: (order as any).orderDate,
      due_date: (order as any).dueDate,
      invoice_number: (order as any).invoiceNumber,
      bank_info: (order as any).bankInfo,
      receipt_url: (order as any).receiptUrl,
      notes: order.notes,
      created_at: (order as any).createdAt,
      updated_at: (order as any).updatedAt,
    };
    await supabase.from('orders').insert([snakeCaseOrder]);
    await fetchAll();
  }, [fetchAll]);

  const updateOrder = useCallback(async (order: Order) => {
    // Mapear campos a snake_case para Supabase
    const snakeCaseOrder = {
      provider_id: (order as any).providerId,
      user_id: order.user_id,
      items: order.items,
      status: order.status,
      total_amount: (order as any).totalAmount,
      currency: order.currency,
      order_date: (order as any).orderDate,
      due_date: (order as any).dueDate,
      invoice_number: (order as any).invoiceNumber,
      bank_info: (order as any).bankInfo,
      receipt_url: (order as any).receiptUrl,
      notes: order.notes,
      created_at: (order as any).createdAt,
      updated_at: (order as any).updatedAt,
    };
    await supabase.from('orders').update(snakeCaseOrder).eq('id', order.id);
    await fetchAll();
  }, [fetchAll]);

  const deleteOrder = useCallback(async (id: string, user_id: string) => {
    await supabase.from('orders').delete().eq('id', id).eq('user_id', user_id);
    await fetchAll();
  }, [fetchAll]);

  // CRUD: Providers
  // Permitir batch insert
  const addProvider = useCallback(async (providerOrProviders: Partial<Provider>|Partial<Provider>[], user_id: string, batch = false) => {
    if (batch && Array.isArray(providerOrProviders)) {
      const result = await supabase.from('providers').insert(providerOrProviders);
      await fetchAll();
      return result;
    }
    const provider = Array.isArray(providerOrProviders) ? providerOrProviders[0] : providerOrProviders;
    const result = await supabase.from('providers').insert([{ ...provider, user_id }]);
    await fetchAll();
    return result;
  }, [fetchAll]);

  const updateProvider = useCallback(async (provider: Provider) => {
    await supabase.from('providers').update(provider).eq('id', provider.id);
    await fetchAll();
  }, [fetchAll]);

  // Permitir batch delete
  const deleteProvider = useCallback(async (idOrIds: string | string[], user_id: string, batch = false, forceDelete = false) => {
    try {
      if (batch && Array.isArray(idOrIds)) {
        // Borrar uno por uno para evitar errores 409
        let successCount = 0;
        let errorCount = 0;
        let deletedOrdersCount = 0;
        
        for (const id of idOrIds) {
          try {
            // Primero verificar si el proveedor existe y pertenece al usuario
            const { data: provider, error: checkError } = await supabase
              .from('providers')
              .select('id, name')
              .eq('id', id)
              .eq('user_id', user_id)
              .single();
            
            if (checkError || !provider) {
              console.error(`Provider ${id} no encontrado o no pertenece al usuario:`, checkError);
              errorCount++;
              continue;
            }
            
            // Verificar si tiene pedidos asociados
            const { data: orders, error: ordersError } = await supabase
              .from('orders')
              .select('id')
              .eq('provider_id', id);
            
            if (ordersError) {
              console.error(`Error checking orders for provider ${id}:`, ordersError);
            } else if (orders && orders.length > 0) {
              if (forceDelete) {
                // Borrar pedidos asociados primero
                console.log(`Borrando ${orders.length} pedidos asociados al proveedor ${id} (${provider.name})`);
                const { error: deleteOrdersError } = await supabase
                  .from('orders')
                  .delete()
                  .eq('provider_id', id)
                  .eq('user_id', user_id);
                
                if (deleteOrdersError) {
                  console.error(`Error deleting orders for provider ${id}:`, deleteOrdersError);
                  errorCount++;
                  continue;
                } else {
                  deletedOrdersCount += orders.length;
                  console.log(`${orders.length} pedidos eliminados para el proveedor ${id} (${provider.name})`);
                }
              } else {
                console.error(`Provider ${id} (${provider.name}) tiene ${orders.length} pedidos asociados y no puede ser eliminado`);
                errorCount++;
                continue;
              }
            }
            
            // Intentar borrar el proveedor
            const { error } = await supabase.from('providers').delete().eq('id', id).eq('user_id', user_id);
            if (error) {
              console.error(`Error deleting provider ${id} (${provider.name}):`, error);
              errorCount++;
            } else {
              console.log(`Provider ${id} (${provider.name}) eliminado exitosamente`);
              successCount++;
            }
          } catch (err) {
            console.error(`Error deleting provider ${id}:`, err);
            errorCount++;
          }
        }
        
        console.log(`Borrado completado: ${successCount} proveedores exitosos, ${errorCount} errores, ${deletedOrdersCount} pedidos eliminados`);
        
        if (errorCount > 0) {
          console.warn(`⚠️ ${errorCount} proveedores no pudieron ser eliminados. Revisa los logs anteriores para más detalles.`);
        }
        
        await fetchAll();
        return;
      }
      
      const id = Array.isArray(idOrIds) ? idOrIds[0] : idOrIds;
      const { error } = await supabase.from('providers').delete().eq('id', id).eq('user_id', user_id);
      if (error) {
        console.error('Error deleting provider:', error);
        throw error;
      }
      await fetchAll();
    } catch (error) {
      console.error('Error in deleteProvider:', error);
      throw error;
    }
  }, [fetchAll]);

  // CRUD: Stock
  // Permitir batch insert
  const addStockItem = useCallback(async (itemOrItems: Partial<StockItem>|Partial<StockItem>[], user_id: string, batch = false) => {
    if (batch && Array.isArray(itemOrItems)) {
      // Insertar todos los items en un solo llamado
      const { error } = await supabase.from('stock').insert(itemOrItems);
      if (error) {
        console.error('Supabase error al insertar stock (batch):', error, itemOrItems);
        setErrorMsg('Error al insertar stock: ' + (error.message || error.details || ''));
        throw error;
      }
      await fetchAll();
      return;
    }
    // Comportamiento original: uno por uno
    const item = Array.isArray(itemOrItems) ? itemOrItems[0] : itemOrItems;
    const snakeCaseItem = {
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
      user_id: user_id,
    };
    const { error } = await supabase.from('stock').insert([snakeCaseItem]);
    if (error) {
      console.error('Supabase error al insertar stock:', error, snakeCaseItem);
      setErrorMsg('Error al insertar stock: ' + (error.message || error.details || ''));
      throw error;
    }
    await fetchAll();
  }, [fetchAll]);

  const updateStockItem = useCallback(async (item: StockItem) => {
    await supabase.from('stock').update(item).eq('id', item.id);
    await fetchAll();
  }, [fetchAll]);

  // Permitir batch delete
  const deleteStockItem = useCallback(async (idOrIds: string | string[], user_id: string, batch = false) => {
    if (batch && Array.isArray(idOrIds)) {
      await supabase.from('stock').delete().in('id', idOrIds).eq('user_id', user_id);
      await fetchAll();
      return;
    }
    const id = Array.isArray(idOrIds) ? idOrIds[0] : idOrIds;
    await supabase.from('stock').delete().eq('id', id).eq('user_id', user_id);
    await fetchAll();
  }, [fetchAll]);

  return (
    <DataContext.Provider value={{
      orders,
      providers,
      stockItems,
      loading,
      fetchAll,
      addOrder,
      updateOrder,
      deleteOrder,
      addProvider,
      updateProvider,
      deleteProvider,
      addStockItem,
      updateStockItem,
      deleteStockItem,
    }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
            {errorMsg && <div className="mt-4 text-red-500">{errorMsg}</div>}
          </div>
        </div>
      ) : errorMsg ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">{errorMsg}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  );
};

// ---
// Recommended RLS policy for users table (add in Supabase SQL editor):
//
// alter table users enable row level security;
// create policy "Allow select and insert for all" on users for select using (true);
// create policy "Allow insert for all" on users for insert with check (true);
//
// For production, restrict as needed (e.g. auth.uid() = id)
// --- 