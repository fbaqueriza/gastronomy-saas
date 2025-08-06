// Script para verificar las credenciales de Meta Cloud API
const verifyMetaCredentials = async () => {
  console.log('🔍 Verificando credenciales de Meta Cloud API...');
  
  // Leer variables de entorno desde .env.local
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    const accessToken = envVars.WHATSAPP_API_KEY;
    const phoneNumberId = envVars.WHATSAPP_PHONE_NUMBER_ID;
    const businessAccountId = envVars.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    console.log('📋 Credenciales encontradas:');
    console.log('Access Token:', accessToken ? 'EXISTS' : 'MISSING');
    console.log('Phone Number ID:', phoneNumberId);
    console.log('Business Account ID:', businessAccountId);
    
    if (!accessToken || !phoneNumberId) {
      console.error('❌ Credenciales incompletas');
      return;
    }
    
    // Test 1: Verificar acceso al número de teléfono
    console.log('\n🔑 Verificando acceso al número de teléfono...');
    const phoneResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?access_token=${accessToken}`);
    
    if (phoneResponse.ok) {
      const phoneData = await phoneResponse.json();
      console.log('✅ Número de teléfono válido:', phoneData);
    } else {
      const errorData = await phoneResponse.text();
      console.error('❌ Error verificando número de teléfono:', phoneResponse.status, errorData);
    }
    
    // Test 2: Verificar cuenta de negocio
    console.log('\n🏢 Verificando cuenta de negocio...');
    const businessResponse = await fetch(`https://graph.facebook.com/v18.0/${businessAccountId}?access_token=${accessToken}`);
    
    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      console.log('✅ Cuenta de negocio válida:', businessData);
    } else {
      const errorData = await businessResponse.text();
      console.error('❌ Error verificando cuenta de negocio:', businessResponse.status, errorData);
    }
    
    // Test 3: Intentar enviar un mensaje de prueba
    console.log('\n📤 Probando envío de mensaje...');
    const messageData = {
      messaging_product: 'whatsapp',
      to: '+5491135562673',
      type: 'text',
      text: {
        body: 'Prueba de verificación de credenciales'
      }
    };
    
    const messageResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    if (messageResponse.ok) {
      const messageResult = await messageResponse.json();
      console.log('✅ Mensaje enviado exitosamente:', messageResult);
    } else {
      const errorData = await messageResponse.text();
      console.error('❌ Error enviando mensaje:', messageResponse.status, errorData);
    }
    
  } catch (error) {
    console.error('💥 Error verificando credenciales:', error);
  }
  
  console.log('\n🏁 Verificación completada');
};

// Ejecutar verificación
verifyMetaCredentials(); 