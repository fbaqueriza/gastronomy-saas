// Script para probar las credenciales actualizadas de Twilio
const fs = require('fs');
const path = require('path');

const testTwilioUpdated = async () => {
  console.log('🧪 Probando credenciales actualizadas de Twilio...');
  
  // Leer credenciales del archivo .env.local
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Extraer credenciales
    const accountSidMatch = envContent.match(/TWILIO_ACCOUNT_SID=([^\n]+)/);
    const authTokenMatch = envContent.match(/TWILIO_AUTH_TOKEN=([^\n]+)/);
    const phoneNumberMatch = envContent.match(/TWILIO_PHONE_NUMBER=([^\n]+)/);
    
    const accountSid = accountSidMatch ? accountSidMatch[1] : null;
    const authToken = authTokenMatch ? authTokenMatch[1] : null;
    const phoneNumber = phoneNumberMatch ? phoneNumberMatch[1] : null;
    
    console.log('📋 Credenciales leídas del .env.local:');
    console.log('Account SID:', accountSid ? accountSid.substring(0, 10) + '...' : 'NO ENCONTRADO');
    console.log('Auth Token:', authToken ? 'CONFIGURADO (' + authToken.length + ' caracteres)' : 'NO CONFIGURADO');
    console.log('Phone Number:', phoneNumber || 'NO CONFIGURADO');
    
    if (!accountSid || !authToken || !phoneNumber) {
      console.error('❌ Faltan credenciales en .env.local');
      return;
    }
    
    // Probar autenticación con Twilio
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
    
    // Probar envío de mensaje real
    console.log('\n📤 Probando envío de mensaje real...');
    
    const messageData = {
      From: `whatsapp:${phoneNumber}`,
      To: 'whatsapp:+5491135562673',
      Body: 'Prueba de mensaje real desde Twilio actualizado - ' + new Date().toISOString()
    };
    
    const sendResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(messageData)
    });
    
    console.log('📡 Respuesta del envío:', sendResponse.status, sendResponse.statusText);
    
    if (sendResponse.ok) {
      const data = await sendResponse.json();
      console.log('✅ Mensaje enviado exitosamente a Twilio');
      console.log('📱 Message SID:', data.sid);
      console.log('📊 Estado:', data.status);
    } else {
      const errorData = await sendResponse.text();
      console.error('❌ Error enviando mensaje:', errorData);
    }
    
  } catch (error) {
    console.error('💥 Error leyendo credenciales o probando Twilio:', error);
  }
  
  console.log('\n🏁 Prueba de credenciales actualizadas completada');
};

// Ejecutar verificación
testTwilioUpdated(); 