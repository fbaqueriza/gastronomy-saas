// Script para probar WhatsApp Sandbox
const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.log('Error leyendo .env.local:', error.message);
    return {};
  }
}

async function testSandbox() {
  console.log('🔍 Probando WhatsApp Sandbox...');
  
  const env = loadEnvFile();
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const phoneNumber = env.TWILIO_PHONE_NUMBER;
  
  console.log('📋 Credenciales encontradas:');
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', authToken ? 'CONFIGURADO' : 'NO CONFIGURADO');
  console.log('Phone Number:', phoneNumber);
  
  if (!accountSid || !authToken || !phoneNumber) {
    console.log('❌ Faltan credenciales de Twilio');
    return;
  }
  
  // Probar autenticación con fetch nativo
  try {
    console.log('🔐 Probando autenticación con Twilio...');
    
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const account = await response.json();
      console.log('✅ Autenticación exitosa');
      console.log('Account Status:', account.status);
      console.log('Account Type:', account.type);
      
      // Probar envío de mensaje con sandbox
      console.log('📤 Probando envío de mensaje con sandbox...');
      const messageResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          Body: 'Prueba de WhatsApp Sandbox desde Gastronomy SaaS',
          From: `whatsapp:${phoneNumber}`,
          To: 'whatsapp:+5491135562673'
        })
      });
      
      if (messageResponse.ok) {
        const message = await messageResponse.json();
        console.log('✅ Mensaje enviado exitosamente');
        console.log('Message SID:', message.sid);
        console.log('Message Status:', message.status);
        console.log('📱 Verifica tu WhatsApp para ver el mensaje');
      } else {
        const error = await messageResponse.text();
        console.log('❌ Error enviando mensaje:', messageResponse.status, error);
        
        if (error.includes('63007')) {
          console.log('\n🔧 SOLUCIÓN:');
          console.log('1. Ve a https://console.twilio.com');
          console.log('2. Ve a Messaging > Try it out > Send a WhatsApp message');
          console.log('3. Copia el número de sandbox y el código de activación');
          console.log('4. Envía el código de activación al número de sandbox desde tu WhatsApp');
          console.log('5. Actualiza TWILIO_PHONE_NUMBER en .env.local con el número de sandbox');
        }
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Error de autenticación:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSandbox().catch(console.error); 