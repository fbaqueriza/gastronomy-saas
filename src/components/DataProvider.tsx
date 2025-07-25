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
  addProvider: (provider: Partial<Provider>, user_id: string) => Promise<any>;
  updateProvider: (provider: Provider) => Promise<void>;
  deleteProvider: (id: string, user_id: string) => Promise<void>;
  addStockItem: (item: Partial<StockItem>, user_id: string) => Promise<void>;
  updateStockItem: (item: StockItem) => Promise<void>;
  deleteStockItem: (id: string, user_id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

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
    setProviders(provs || []);
    setOrders(ords || []);
    setStockItems(stocks || []);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) fetchAll();
  }, [currentUserId, fetchAll]);

  // CRUD: Orders
  const addOrder = useCallback(async (order: Partial<Order>, user_id: string) => {
    await supabase.from('orders').insert([{ ...order, user_id }]);
    await fetchAll();
  }, [fetchAll]);

  const updateOrder = useCallback(async (order: Order) => {
    await supabase.from('orders').update(order).eq('id', order.id);
    await fetchAll();
  }, [fetchAll]);

  const deleteOrder = useCallback(async (id: string, user_id: string) => {
    await supabase.from('orders').delete().eq('id', id).eq('user_id', user_id);
    await fetchAll();
  }, [fetchAll]);

  // CRUD: Providers
  const addProvider = useCallback(async (provider: Partial<Provider>, user_id: string) => {
    const result = await supabase.from('providers').insert([{ ...provider, user_id }]);
    await fetchAll();
    return result;
  }, [fetchAll]);

  const updateProvider = useCallback(async (provider: Provider) => {
    await supabase.from('providers').update(provider).eq('id', provider.id);
    await fetchAll();
  }, [fetchAll]);

  const deleteProvider = useCallback(async (id: string, user_id: string) => {
    await supabase.from('providers').delete().eq('id', id).eq('user_id', user_id);
    await fetchAll();
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

  const deleteStockItem = useCallback(async (id: string, user_id: string) => {
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