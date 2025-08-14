// Utilidades para Server-Sent Events (SSE)

// Almacenar clientes conectados con información adicional
interface SSEClient {
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
  id: string;
}

const clients = new Map<string, SSEClient>();

// Buffer de mensajes para clientes desconectados (últimos 10 mensajes)
const messageBuffer: Array<{
  type: string;
  contactId: string;
  id: string;
  content: string;
  timestamp: string;
}> = [];

let clientCounter = 0;

// Función para enviar mensaje a todos los clientes conectados - TIEMPO REAL
export function sendMessageToClients(message: any) {
  // Guardar mensaje en buffer si es un mensaje de WhatsApp
  if (message.type === 'whatsapp_message') {
    messageBuffer.push(message);
    // Mantener solo los últimos 20 mensajes (más buffer para WhatsApp real)
    if (messageBuffer.length > 20) {
      messageBuffer.shift();
    }
    console.log(`💾 Mensaje guardado en buffer. Total en buffer: ${messageBuffer.length}`);
  }

  const messageData = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();
  const data = encoder.encode(messageData);

  console.log(`📤 Enviando mensaje SSE a ${clients.size} clientes INSTANTÁNEAMENTE:`, message);
  console.log(`📤 Mensaje codificado:`, messageData);

  const disconnectedClients: string[] = [];
  let sentToClients = 0;

  // Enviar mensaje a TODOS los clientes conectados INMEDIATAMENTE
  clients.forEach((client, clientId) => {
    try {
      client.controller.enqueue(data);
      sentToClients++;
      console.log(`✅ Mensaje enviado INSTANTÁNEAMENTE a cliente ${clientId}`);
    } catch (error) {
      console.log(`❌ Error enviando mensaje a cliente ${clientId}, removiendo...`);
      disconnectedClients.push(clientId);
    }
  });

  // Remover clientes desconectados
  disconnectedClients.forEach(clientId => {
    clients.delete(clientId);
  });

  if (disconnectedClients.length > 0) {
    console.log(`🔌 ${disconnectedClients.length} clientes removidos por desconexión`);
  }

  // Si no se envió a ningún cliente, el mensaje ya está en el buffer
  // y se enviará cuando se reconecte un cliente
  if (sentToClients === 0 && message.type === 'whatsapp_message') {
    console.log(`📤 Mensaje guardado en buffer para envío posterior`);
  } else if (sentToClients > 0) {
    console.log(`✅ Mensaje enviado INSTANTÁNEAMENTE a ${sentToClients} clientes`);
  }
}

// Función para enviar mensaje a un contacto específico
export function sendMessageToContact(contactId: string, message: any) {
  const messageWithContact = {
    ...message,
    contactId,
    type: 'whatsapp_message'
  };
  
  sendMessageToClients(messageWithContact);
}

// Función para agregar cliente
export function addClient(controller: ReadableStreamDefaultController): string {
  const clientId = `client_${++clientCounter}_${Date.now()}`;
  const client: SSEClient = {
    controller,
    connectedAt: new Date(),
    id: clientId
  };
  
  clients.set(clientId, client);
  console.log(`✅ Cliente SSE agregado. ID: ${clientId}, Total: ${clients.size}`);
  
  // Enviar mensajes del buffer al cliente que se reconecta - INSTANTÁNEO
  if (messageBuffer.length > 0) {
    console.log(`📤 Enviando ${messageBuffer.length} mensajes del buffer al cliente ${clientId} - INSTANTÁNEO`);
    
    // Enviar mensajes INSTANTÁNEAMENTE sin delays
    messageBuffer.forEach((message, index) => {
      try {
        const messageData = `data: ${JSON.stringify(message)}\n\n`;
        const encoder = new TextEncoder();
        const data = encoder.encode(messageData);
        controller.enqueue(data);
        console.log(`📤 Mensaje ${index + 1}/${messageBuffer.length} enviado INSTANTÁNEAMENTE al cliente ${clientId}`);
      } catch (error) {
        console.log(`❌ Error enviando mensaje del buffer a cliente ${clientId}:`, error);
      }
    });
  }
  
  return clientId;
}

// Función para remover cliente
export function removeClient(clientId: string) {
  const client = clients.get(clientId);
  if (client) {
    clients.delete(clientId);
    console.log(`🔌 Cliente SSE removido. ID: ${clientId}, Total: ${clients.size}`);
  }
}

// Función para obtener número de clientes
export function getClientCount() {
  return clients.size;
}

// Función para obtener información de clientes
export function getClientsInfo() {
  const clientsInfo = Array.from(clients.entries()).map(([id, client]) => ({
    id,
    connectedAt: client.connectedAt,
    lastPing: client.lastPing,
    uptime: Date.now() - client.connectedAt.getTime()
  }));
  
  return {
    count: clients.size,
    clients: clientsInfo
  };
}

// Función para limpiar clientes inactivos
export function cleanupInactiveClients(maxInactiveTime = 5 * 60 * 1000) { // 5 minutos
  const now = Date.now();
  const inactiveClients: string[] = [];
  
  clients.forEach((client, clientId) => {
    const inactiveTime = now - client.lastPing.getTime();
    if (inactiveTime > maxInactiveTime) {
      inactiveClients.push(clientId);
    }
  });
  
  inactiveClients.forEach(clientId => {
    removeClient(clientId);
  });
  
  if (inactiveClients.length > 0) {
    console.log(`🧹 ${inactiveClients.length} clientes inactivos removidos`);
  }
} 