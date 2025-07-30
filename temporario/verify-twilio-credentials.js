// Script para verificar las credenciales de Twilio directamente
const verifyTwilioCredentials = async () => {
  console.log('🔍 Verificando credenciales de Twilio...');
  
  const accountSid = 'AC77e5f225ccbe209a49da792ff3d7c5c4';
  const authToken = 'ca988d05725e1c4659b7875d7aed2461';
  const phoneNumber = '+14155238886';
  
  console.log('📋 Credenciales configuradas:');
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', authToken ? 'CONFIGURADO' : 'NO CONFIGURADO');
  console.log('Phone Number:', phoneNumber);
  
  // Probar autenticación con Twilio
  try {
    console.log('\n🔐 Probando autenticación con Twilio...');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Respuesta de Twilio:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Autenticación exitosa con Twilio');
      console.log('📊 Información de la cuenta:', {
        accountSid: data.account_sid,
        status: data.status
      });
    } else {
      const errorData = await response.text();
      console.error('❌ Error de autenticación con Twilio:', errorData);
    }
    
  } catch (error) {
    console.error('💥 Error verificando credenciales:', error);
  }
  
  // Probar envío de mensaje real
  try {
    console.log('\n📤 Probando envío de mensaje real...');
    
    const messageData = {
      From: `whatsapp:${phoneNumber}`,
      To: 'whatsapp:+5491135562673',
      Body: 'Prueba de mensaje real desde Twilio - ' + new Date().toISOString()
    };
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(messageData)
    });
    
    console.log('📡 Respuesta del envío:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mensaje enviado exitosamente a Twilio');
      console.log('📱 Message SID:', data.sid);
      console.log('📊 Estado:', data.status);
    } else {
      const errorData = await response.text();
      console.error('❌ Error enviando mensaje:', errorData);
    }
    
  } catch (error) {
    console.error('💥 Error en envío de mensaje:', error);
  }
  
  console.log('\n🏁 Verificación de credenciales completada');
};

// Ejecutar verificación
verifyTwilioCredentials(); 