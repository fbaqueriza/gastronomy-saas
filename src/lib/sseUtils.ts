// Utilidades para Server-Sent Events (SSE)

// Almacenar clientes conectados
const clients = new Set<ReadableStreamDefaultController>();

// Función para enviar mensaje a todos los clientes conectados
export function sendMessageToClients(message: any) {
  const messageData = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();
  const data = encoder.encode(messageData);

  console.log(`📤 Enviando mensaje SSE a ${clients.size} clientes:`, message);

  clients.forEach(controller => {
    try {
      controller.enqueue(data);
    } catch (error) {
      console.log('Error enviando mensaje a cliente SSE, removiendo...');
      clients.delete(controller);
    }
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
export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
  console.log(`✅ Cliente SSE agregado. Total: ${clients.size}`);
}

// Función para remover cliente
export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
  console.log(`🔌 Cliente SSE removido. Total: ${clients.size}`);
}

// Función para obtener número de clientes
export function getClientCount() {
  return clients.size;
} 