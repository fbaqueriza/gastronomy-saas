const twilio = require('twilio');
require('dotenv').config({ path: '.env.local' });

async function verifyTwilioCredentials() {
  console.log('🔍 Verificando credenciales actuales de Twilio...');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  console.log('📋 Credenciales configuradas:');
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', authToken ? 'CONFIGURADO' : 'NO CONFIGURADO');
  console.log('Phone Number:', phoneNumber);
  
  if (!accountSid || !authToken || !phoneNumber) {
    console.log('❌ Faltan credenciales de Twilio');
    return;
  }
  
  try {
    console.log('🔐 Probando autenticación con Twilio...');
    const client = twilio(accountSid, authToken);
    
    // Verificar la cuenta
    const account = await client.api.accounts(accountSid).fetch();
    console.log('✅ Autenticación exitosa');
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);
    
    // Probar envío de mensaje
    console.log('📤 Probando envío de mensaje...');
    const message = await client.messages.create({
      body: 'Prueba de verificación de credenciales',
      from: `whatsapp:${phoneNumber}`,
      to: 'whatsapp:+5491135562673'
    });
    
    console.log('✅ Mensaje enviado exitosamente');
    console.log('Message SID:', message.sid);
    console.log('Message Status:', message.status);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Error Code:', error.code);
    console.log('Error Status:', error.status);
  }
}

verifyTwilioCredentials().catch(console.error); 