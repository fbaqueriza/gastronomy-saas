import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Provider, StockItem, WhatsAppMessage } from '../types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DataContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  stockItems: StockItem[];
  setStockItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
  seedLoaded: boolean;
}

interface ChatConversation {
  providerId: string;
  messages: WhatsAppMessage[];
  unreadCount: number;
}

interface ChatContextType {
  conversations: Record<string, ChatConversation>;
  openProviderId: string | null;
  setOpenProviderId: (id: string | null) => void;
  sendMessage: (providerId: string, message: string) => void;
  markAsRead: (providerId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
};

export const DataProvider: React.FC<{ userEmail?: string; children: React.ReactNode }> = ({ userEmail, children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [seedLoaded, setSeedLoaded] = useState(false);

  // Cargar datos desde Supabase al montar
  useEffect(() => {
    if (!userEmail || seedLoaded) return;
    const fetchData = async () => {
      // Obtener user_id desde el perfil de usuario (asumimos email único)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (userError || !userData) {
        setSeedLoaded(true);
        return;
      }
      const user_id = userData.id;
      // Cargar datos filtrados por user_id
      const [{ data: provs }, { data: ords }, { data: stocks }] = await Promise.all([
        supabase.from('providers').select('*').eq('user_id', user_id),
        supabase.from('orders').select('*').eq('user_id', user_id),
        supabase.from('stock').select('*').eq('user_id', user_id),
      ]);
      setProviders(provs || []);
      setOrders(ords || []);
      setStockItems(stocks || []);
      setSeedLoaded(true);
    };
    fetchData();
  }, [userEmail, seedLoaded]);

  // Guardar cambios en Supabase
  // (Implementar funciones add/update/delete para cada entidad, usando user_id)
  // ...

  return (
    <DataContext.Provider value={{ orders, setOrders, providers, setProviders, stockItems, setStockItems, seedLoaded }}>
      {seedLoaded ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
};

export const ChatProvider: React.FC<{ providers: Provider[]; initialConversations?: Record<string, ChatConversation>; children: React.ReactNode }> = ({ providers, initialConversations, children }) => {
  const { userEmail } = (typeof window !== 'undefined' && window.localStorage) ? JSON.parse(window.localStorage.getItem('gastronomy_user') || '{}') : { userEmail: undefined };
  const isSeedUser = userEmail === 'test@test.com';
  const [conversations, setConversations] = useState<Record<string, ChatConversation>>(initialConversations || {});
  const [openProviderId, setOpenProviderId] = useState<string | null>(null);

  // Always seed mock conversations for every provider for the demo user
  useEffect(() => {
    if (isSeedUser) {
      setConversations(() => {
        const seeded: Record<string, ChatConversation> = {};
        providers.forEach((provider) => {
          seeded[provider.id] = {
            providerId: provider.id,
            messages: [
              {
                id: '1',
                orderId: '',
                providerId: provider.id,
                type: 'order',
                message: `¡Hola ${provider.name}! Este es un mensaje de prueba para ${provider.name}.`,
                status: 'sent',
                createdAt: new Date(),
              },
            ],
            unreadCount: 1,
          };
        });
        return seeded;
      });
      return;
    }
    setConversations((prev) => {
      let changed = false;
      const updated: Record<string, ChatConversation> = { ...prev };
      providers.forEach((provider) => {
        if (!updated[provider.id]) {
          updated[provider.id] = {
            providerId: provider.id,
            messages: [],
            unreadCount: 0,
          };
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers.length, isSeedUser]);

  const sendMessage = (providerId: string, message: string) => {
    setConversations((prev) => {
      const now = new Date();
      const msg: WhatsAppMessage = {
        id: Date.now().toString(),
        orderId: '',
        providerId,
        type: 'order',
        message,
        status: 'sent',
        createdAt: now,
      };
      const conv = prev[providerId] || { providerId, messages: [], unreadCount: 0 };
      return {
        ...prev,
        [providerId]: {
          ...conv,
          messages: [...conv.messages, msg],
          unreadCount: conv.unreadCount,
        },
      };
    });
  };

  const markAsRead = (providerId: string) => {
    setConversations((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        unreadCount: 0,
      },
    }));
  };

  return (
    <ChatContext.Provider value={{ conversations, openProviderId, setOpenProviderId, sendMessage, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
}; 