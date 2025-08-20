// Utilidades para Server-Sent Events (SSE)

// Almacenar clientes conectados con información adicional
interface SSEClient {
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
  id: string;
}

const clients = new Map<string, SSEClient>();

// Buffer de mensajes para clientes desconectados (últimos 20 mensajes)
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
  console.log('📤 SSE Utils - Recibiendo mensaje para enviar:', message);
  
  // SIEMPRE guardar mensaje en buffer si es un mensaje de WhatsApp
  if (message.type === 'whatsapp_message') {
    messageBuffer.push(message);
    // Mantener solo los Ãºltimos 20 mensajes (mÃ¡s buffer para WhatsApp real)
    if (messageBuffer.length > 20) {
      messageBuffer.shift();
    }
  }

  const messageData = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();
  const data = encoder.encode(messageData);



  const disconnectedClients: string[] = [];
  let sentToClients = 0;

  // Enviar mensaje a TODOS los clientes conectados INMEDIATAMENTE
  clients.forEach((client, clientId) => {
    try {
      client.controller.enqueue(data);
      sentToClients++;
      console.log(`📤 SSE - Mensaje enviado a cliente ${clientId}`);
    } catch (error) {
      disconnectedClients.push(clientId);
    }
  });

  // Remover clientes desconectados
  disconnectedClients.forEach(clientId => {
    clients.delete(clientId);
  });


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
  
  // Enviar mensajes del buffer al cliente que se reconecta
  if (messageBuffer.length > 0) {
    messageBuffer.forEach((message) => {
      try {
        const messageData = `data: ${JSON.stringify(message)}\n\n`;
        const encoder = new TextEncoder();
        const data = encoder.encode(messageData);
        controller.enqueue(data);
      } catch (error) {
        // Silenciar errores de envío
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
  }
}

// Función para obtener número de clientes
export function getClientCount() {
  return clients.size;
}

// Función para obtener información del buffer
export function getBufferInfo() {
  return {
    bufferLength: messageBuffer.length,
    buffer: messageBuffer,
    clientsCount: clients.size
  };
}

// Función para obtener información de clientes
export function getClientsInfo() {
  const clientsInfo = Array.from(clients.entries()).map(([id, client]) => ({
    id,
    connectedAt: client.connectedAt,
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
    // Usar connectedAt en lugar de lastPing que no existe
    const inactiveTime = now - client.connectedAt.getTime();
    if (inactiveTime > maxInactiveTime) {
      inactiveClients.push(clientId);
    }
  });
  
  inactiveClients.forEach(clientId => {
    removeClient(clientId);
  });
  

} 