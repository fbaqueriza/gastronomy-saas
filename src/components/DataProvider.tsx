import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, Provider, StockItem, WhatsAppMessage } from '../types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DataContextType {
  orders: Order[];
  providers: Provider[];
  stockItems: StockItem[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  addOrder: (order: Partial<Order>, user_id: string) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string, user_id: string) => Promise<void>;
  addProvider: (provider: Partial<Provider>, user_id: string) => Promise<void>;
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (!userError && userData) {
        setCurrentUserId(userData.id);
      }
    };
    fetchUserId();
  }, [userEmail, userId]);

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
    await supabase.from('providers').insert([{ ...provider, user_id }]);
    await fetchAll();
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
  const addStockItem = useCallback(async (item: Partial<StockItem>, user_id: string) => {
    await supabase.from('stock').insert([{ ...item, user_id }]);
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
          </div>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  );
}; 