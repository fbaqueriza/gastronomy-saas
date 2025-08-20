import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Verificar el token y obtener el usuario
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        user = authUser;
      }
    }
    
    // Obtener proveedores usando anon key (con políticas RLS)
    const { data: allProviders, error: allProvidersError } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (allProvidersError) {
      console.error('Error obteniendo todos los proveedores:', allProvidersError);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo proveedores',
        details: allProvidersError.message
      }, { status: 500 });
    }

    // Si hay usuario autenticado, filtrar por user_id
    let providers = allProviders;
    if (user && allProviders && allProviders.length > 0) {
      const userProviders = allProviders.filter(p => p.user_id === user.id);
      providers = userProviders;
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({
        success: true,
        providers: [],
        providersCount: 0,
        totalMessages: 0,
        userEmail: user?.email || null,
        totalProvidersInTable: allProviders?.length || 0
      });
    }

    // Obtener mensajes de WhatsApp para cada proveedor
    const { data: messages, error: messagesError } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (messagesError) {
      console.error('Error obteniendo mensajes:', messagesError);
    }

    // Agrupar mensajes por proveedor
    const messagesByProvider: { [providerId: string]: any[] } = {};
    messages?.forEach(message => {
      const fromPhone = message.contact_id?.replace('549', '+549');
      const provider = providers?.find(p => p.phone === fromPhone);
      if (provider) {
        if (!messagesByProvider[provider.id]) {
          messagesByProvider[provider.id] = [];
        }
        messagesByProvider[provider.id].push(message);
      }
    });

    // Construir respuesta con proveedores y sus mensajes
    const providersWithChat = providers?.map(provider => {
      const providerMessages = messagesByProvider[provider.id] || [];
      const lastMessage = providerMessages[0];
      
      return {
        id: provider.id,
        name: provider.name,
        phone: provider.phone,
        email: provider.email,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.timestamp || new Date().toISOString(),
        unreadCount: providerMessages.filter(m => m.status === 'delivered').length,
        status: 'online',
        messageCount: providerMessages.length,
        messages: providerMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          message_type: msg.message_type,
          status: msg.status,
          timestamp: msg.timestamp
        }))
      };
    }) || [];

    return NextResponse.json({
      success: true,
      providers: providersWithChat,
      providersCount: providersWithChat.length,
      totalMessages: providersWithChat.reduce((sum, provider) => sum + provider.messageCount, 0),
      userEmail: user?.email || null,
      totalProvidersInTable: allProviders?.length || 0
    });
  } catch (error) {
    console.error('Error en providers-test:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
