import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Importar funciones del endpoint SSE
import { sendMessageToContact } from '../../../../../lib/sseUtils';

// Forzar que este endpoint sea dinámico
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase no configurado para twilio/webhook');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Array global para mensajes en memoria (temporal)
let incomingMessages: any[] = [];

// Función para obtener clientes activos desde la base de datos
async function getActiveClientsFromDB() {
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, retornando clientes vacíos');
      return [];
    }
    
    const { data, error } = await supabase
      .from('whatsapp_clients')
      .select('*')
      .eq('active', true);
    
    if (error) {
      console.error('Error obteniendo clientes activos:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error en getActiveClientsFromDB:', error);
    return [];
  }
}

// Función para registrar cliente activo en BD
async function registerActiveClient(contactId: string) {
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, no se puede registrar cliente');
      return;
    }
    
    const { error } = await supabase
      .from('whatsapp_clients')
      .upsert({
        contact_id: contactId,
        active: true,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error registrando cliente activo:', error);
    } else {
      console.log('✅ Cliente registrado como activo:', contactId);
    }
  } catch (error) {
    console.error('Error en registerActiveClient:', error);
  }
}

// Función para marcar cliente como inactivo
async function markClientInactive(contactId: string) {
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, no se puede marcar cliente como inactivo');
      return;
    }
    
    const { error } = await supabase
      .from('whatsapp_clients')
      .update({ 
        active: false, 
        last_seen: new Date().toISOString() 
      })
      .eq('contact_id', contactId);
    
    if (error) {
      console.error('Error marcando cliente como inactivo:', error);
    } else {
      console.log('✅ Cliente marcado como inactivo:', contactId);
    }
  } catch (error) {
    console.error('Error en markClientInactive:', error);
  }
}

// Función para limpiar clientes desconectados
function cleanupDisconnectedClients() {
  // Esta función ya no es necesaria con el nuevo sistema SSE
  console.log('🧹 Limpieza de clientes no necesaria con nuevo sistema SSE');
}

// Función para enviar mensaje a clientes usando el nuevo sistema SSE
async function sendMessageToClients(message: any, phoneNumber: string) {
  console.log(`📤 Enviando mensaje SSE a clientes para contacto: ${phoneNumber}`);
  
  // Usar el nuevo sistema SSE
  sendMessageToContact(phoneNumber, message);
  
  // Si no hay clientes conectados, guardar en BD para persistencia
  console.log('⚠️ Verificando clientes activos en BD...');
  const activeClients = await getActiveClientsFromDB();
  console.log(`📊 Clientes activos en BD: ${activeClients.length}`);
  
  const matchingClients = activeClients.filter(client => 
    client.contact_id === phoneNumber || 
    client.contact_id === `+${phoneNumber}` ||
    client.contact_id === phoneNumber.replace('+', '')
  );
  
  console.log(`📊 Clientes que coinciden en BD: ${matchingClients.length}`);
  
  if (matchingClients.length > 0) {
    console.log('✅ Hay clientes activos en BD, mensaje será entregado cuando se reconecten');
  } else {
    console.log('⚠️ No hay clientes activos para este contacto');
  }
}

// Función para agregar mensaje entrante
async function addIncomingMessage(phoneNumber: string, content: string, messageSid: string, userId?: string) {
  const message = {
    id: messageSid,
    contactId: phoneNumber,
    content: content,
    type: 'received',
    status: 'received',
    timestamp: new Date().toISOString()
  };
  
  // Agregar al array global (temporal)
  incomingMessages.push(message);
  console.log('💾 Mensaje entrante agregado al array:', message);
  console.log('📊 Total de mensajes en memoria:', incomingMessages.length);
  
  // Guardar en base de datos si tenemos userId y Supabase está configurado
  if (userId && supabase) {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert([{
          message_sid: messageSid,
          contact_id: phoneNumber,
          content: content,
          message_type: 'received',
          status: 'received',
          user_id: userId,
          timestamp: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error guardando mensaje en BD:', error);
      } else {
        console.log('✅ Mensaje guardado en base de datos');
      }
    } catch (error) {
      console.error('Error en addIncomingMessage:', error);
    }
  } else if (userId && !supabase) {
    console.warn('⚠️ Supabase no configurado, no se puede guardar mensaje en BD');
  }
  
  // Enviar mensaje a clientes SSE usando el nuevo sistema
  await sendMessageToClients(message, phoneNumber);
  
  // Guardar mensaje en BD para persistencia si Supabase está configurado
  if (supabase) {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert([{
          message_sid: message.id,
          contact_id: phoneNumber,
          content: message.content,
          message_type: 'received',
          status: 'received',
          user_id: userId || 'system',
          timestamp: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error guardando mensaje en BD:', error);
      } else {
        console.log('✅ Mensaje guardado en BD para persistencia');
      }
    } catch (error) {
      console.error('Error guardando mensaje en BD:', error);
    }
  }
  
  console.log('✅ Mensaje procesado:', message);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 WEBHOOK POST RECIBIDO - URL:', request.url);
    console.log('🚨 WEBHOOK POST RECIBIDO - Headers:', Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    
    // Extraer datos del webhook de Twilio
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    
    console.log('🚨 Webhook de Twilio recibido:', {
      messageSid,
      from,
      to,
      body,
      messageStatus,
      timestamp: new Date().toISOString()
    });
    
    // Log todos los campos del formData para debuggear
    console.log('🚨 Todos los campos del formData:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // Guardar mensaje entrante en localStorage (para el frontend)
    if (body && from && from.includes('whatsapp:')) {
      const phoneNumber = from.replace('whatsapp:', '');
      
      console.log('💬 Mensaje entrante de:', phoneNumber);
      console.log('📝 Contenido:', body);
      
      // Crear objeto de mensaje entrante
      const incomingMessage = {
        id: messageSid,
        type: 'received',
        content: body,
        timestamp: new Date().toISOString(),
        contactId: phoneNumber,
        status: 'received'
      };
      
      console.log('💾 Mensaje entrante guardado:', incomingMessage);
      
      // Guardar en localStorage para que el frontend pueda acceder
      // Esto se hará a través de una API endpoint que el frontend pueda llamar
      console.log('📱 Nuevo mensaje de WhatsApp:', {
        from: phoneNumber,
        message: body,
        time: new Date().toISOString()
      });
      
             // Guardar mensaje entrante en el array global y base de datos
      // Por ahora no tenemos userId en el webhook, pero podemos guardar sin él
      console.log('🔄 Llamando a addIncomingMessage para:', phoneNumber);
      const savedMessage = await addIncomingMessage(phoneNumber, body, messageSid);
      console.log('✅ Mensaje procesado:', savedMessage);
    }

    // Responder con TwiML vacío para no enviar mensaje automático
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error en webhook de Twilio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificación de webhook de Twilio
    const url = new URL(request.url);
    const challenge = url.searchParams.get('challenge');
    
    if (challenge) {
      console.log('🔐 Verificación de webhook de Twilio recibida');
      return new NextResponse(challenge, { status: 200 });
    }
    
    // Si no es un challenge, redirigir al endpoint SSE
    console.log('📡 Redirigiendo a endpoint SSE...');
    return NextResponse.redirect(new URL('/api/whatsapp/sse', request.url));
    
  } catch (error) {
    console.error('Error en GET webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 