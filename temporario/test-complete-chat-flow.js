// Script para simular el flujo completo del chat
const testCompleteChatFlow = async () => {
  console.log('🧪 Probando flujo completo del chat...');
  
  // Simular datos de proveedores
  const mockProviders = [
    {
      id: '1',
      name: 'Francisco Baqueriza',
      phone: '+5491135562673',
      email: 'francisco@example.com',
      address: 'Buenos Aires, Argentina',
      category: 'Proveedor'
    }
  ];
  
  // Simular la función sendMessage del ChatContext
  const sendMessage = async (contactId, content) => {
    console.log('🔍 DEBUG sendMessage - Iniciando envío:', { contactId, content });
    
    if (!contactId || !content.trim()) {
      console.error('❌ sendMessage - Parámetros inválidos:', { contactId, content });
      return;
    }

    // Normalizar número de teléfono
    let normalizedPhone = contactId.replace(/[\s\-\(\)]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }
    
    console.log('📞 sendMessage - Teléfono normalizado:', { original: contactId, normalized: normalizedPhone });

    try {
      console.log('🌐 sendMessage - Enviando a la API:', { to: normalizedPhone, message: content });
      
      const response = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          message: content
        }),
      });

      console.log('📡 sendMessage - Respuesta de la API:', response.status, response.statusText);

      const result = await response.json();
      
      console.log('📋 sendMessage - Resultado de la API:', result);

      if (result.success) {
        console.log('✅ sendMessage - Mensaje enviado exitosamente:', result);
        return result;
      } else {
        console.error('❌ sendMessage - Error sending message:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('💥 sendMessage - Error sending message:', error);
      throw error;
    }
  };
  
  // Simular handleSendMessage del IntegratedChatPanel
  const handleSendMessage = async (selectedContact, message) => {
    console.log('🔍 DEBUG handleSendMessage - Iniciando:', { 
      message: message, 
      selectedContact: selectedContact,
      hasMessage: !!message.trim(),
      hasContact: !!selectedContact
    });
    
    if (!message.trim() || !selectedContact) {
      console.log('❌ handleSendMessage - No se puede enviar mensaje:', { 
        hasMessage: !!message.trim(), 
        hasContact: !!selectedContact,
        messageLength: message.length,
        contact: selectedContact 
      });
      return;
    }

    const messageToSend = message.trim();
    console.log('📤 handleSendMessage - Enviando mensaje desde panel integrado:', { 
      message: messageToSend, 
      to: selectedContact.phone,
      contact: selectedContact 
    });
    
    try {
      console.log('📞 handleSendMessage - Llamando a sendMessage con:', {
        contactId: selectedContact.phone,
        content: messageToSend
      });
      
      const result = await sendMessage(selectedContact.phone, messageToSend);
      console.log('✅ handleSendMessage - Mensaje enviado exitosamente desde panel integrado');
      return result;
    } catch (error) {
      console.error('💥 handleSendMessage - Error sending message from integrated panel:', error);
      throw error;
    }
  };
  
  // Probar el flujo completo
  const testMessages = [
    'Hola, ¿cómo estás?',
    '¿Tienes stock disponible?',
    'Necesito hacer un pedido urgente',
    'Gracias por tu atención'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n📝 Enviando mensaje ${i + 1}: "${message}"`);
    
    try {
      const result = await handleSendMessage(mockProviders[0], message);
      console.log(`✅ Mensaje ${i + 1} enviado exitosamente:`, result.messageId);
    } catch (error) {
      console.error(`❌ Error enviando mensaje ${i + 1}:`, error);
    }
    
    // Esperar entre mensajes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Flujo completo del chat probado');
};

// Ejecutar pruebas
testCompleteChatFlow(); 