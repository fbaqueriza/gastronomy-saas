import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Array global para mensajes en memoria (temporal)
let incomingMessages: any[] = [];

// Usar un Map para clientes SSE con mejor persistencia
const clients = new Map<string, any>();

// Función para obtener clientes activos desde la base de datos
async function getActiveClientsFromDB() {
  try {
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
  const disconnectedClients: string[] = [];
  
  clients.forEach((client, contactId) => {
    try {
      // Verificar si el cliente sigue activo
      if (client.write && typeof client.write === 'function') {
        // Cliente activo, mantenerlo
      } else {
        disconnectedClients.push(contactId);
      }
    } catch (error) {
      console.log(`🔌 Cliente desconectado para ${contactId}, removiendo...`);
      disconnectedClients.push(contactId);
    }
  });
  
  // Remover clientes desconectados
  disconnectedClients.forEach(contactId => {
    clients.delete(contactId);
  });
  
  if (disconnectedClients.length > 0) {
    console.log(`🧹 Limpieza: ${disconnectedClients.length} clientes removidos`);
  }
}

// Función para enviar mensaje a todos los clientes SSE
async function sendMessageToClients(message: any, phoneNumber: string) {
  console.log(`📤 Enviando mensaje SSE a clientes: ${clients.size} clientes conectados`);
  
  const eventData = `data: ${JSON.stringify(message)}\n\n`;
  
  let sentCount = 0;
  clients.forEach((client, contactId) => {
    try {
      if (client.write && typeof client.write === 'function') {
        client.write(eventData);
        sentCount++;
        console.log(`✅ Mensaje enviado a cliente: ${contactId}`);
      }
    } catch (error) {
      console.log(`❌ Error enviando mensaje a cliente ${contactId}:`, error);
    }
  });
  
  console.log(`📤 Mensaje enviado a ${sentCount} clientes para contacto: ${phoneNumber}`);
  
  // Si no hay clientes conectados, guardar en BD para persistencia
  if (sentCount === 0) {
    console.log('⚠️ No hay clientes SSE en memoria, verificando BD...');
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
  
  // Guardar en base de datos si tenemos userId
  if (userId) {
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
  }
  
  // Limpiar clientes desconectados antes de enviar mensajes
  cleanupDisconnectedClients();
  
  // Enviar mensaje a clientes SSE
  await sendMessageToClients(message, phoneNumber);
  
  // Guardar mensaje en BD para persistencia
  try {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert([{
        message_sid: message.id,
        contact_id: phoneNumber,
        content: message.content,
        message_type: 'received',
        status: 'received',
        user_id: 'default-user',
        timestamp: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error guardando mensaje en BD:', error);
    } else {
      console.log('✅ Mensaje guardado en BD para persistencia');
    }
  } catch (error) {
    console.error('Error en persistencia de mensaje:', error);
  }
  
  return message;
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
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

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
    return new NextResponse(challenge, { status: 200 });
  }
  
    // Endpoint para SSE
    const contactId = url.searchParams.get('contactId');
    
    if (!contactId) {
      return new NextResponse('Contact ID required', { status: 400 });
    }
    
    console.log('🔌 Cliente SSE conectado para contacto:', contactId);
    
    // Configurar headers para SSE
    const response = new NextResponse(
      new ReadableStream({
        start(controller) {
          try {
            // Enviar mensaje de prueba para mantener la conexión
            const testEvent = `data: ${JSON.stringify({ 
              id: 'test-connection', 
              type: 'test', 
              content: 'Conexión establecida', 
              timestamp: new Date().toISOString(),
              status: 'test'
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(testEvent));
            
            // Enviar mensajes existentes primero
            const existingMessages = incomingMessages.filter(msg => msg.contactId === contactId);
            if (existingMessages.length > 0) {
              const eventData = `data: ${JSON.stringify({ type: 'existing', messages: existingMessages })}\n\n`;
              controller.enqueue(new TextEncoder().encode(eventData));
            }
            
            // Agregar cliente a la lista usando Map
            const client = {
              write: (data: string) => {
                try {
                  console.log('📤 Escribiendo datos al cliente SSE:', data.substring(0, 100) + '...');
                  controller.enqueue(new TextEncoder().encode(data));
                  console.log('✅ Datos enviados al cliente SSE');
                } catch (error) {
                  console.error('Error enviando datos al cliente:', error);
                }
              }
            };
            
            clients.set(contactId, client);
            console.log('✅ Cliente SSE registrado:', contactId);
            
            // Registrar cliente activo en BD
            registerActiveClient(contactId);
            

            
            // Limpiar cuando se desconecte
            request.signal.addEventListener('abort', () => {
              console.log('🔌 Cliente SSE desconectado (abort signal):', contactId);
              clients.delete(contactId);
              markClientInactive(contactId);
            });
          } catch (error) {
            console.error('Error en SSE start:', error);
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        }
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error en GET webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 