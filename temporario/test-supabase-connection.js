// Script para verificar la conexión directa a Supabase
const testSupabaseConnection = async () => {
  console.log('🔍 Verificando conexión directa a Supabase...');
  
  try {
    // Leer variables de entorno
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('📋 Variables de entorno:');
    console.log('Supabase URL:', supabaseUrl ? 'EXISTS' : 'MISSING');
    console.log('Supabase Key:', supabaseAnonKey ? 'EXISTS' : 'MISSING');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variables de Supabase no configuradas');
      return;
    }
    
    // Generar UUID válido
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    // Intentar insertar un mensaje de prueba directamente
    const testMessage = {
      id: generateUUID(),
      content: 'Mensaje de prueba directo',
      timestamp: new Date().toISOString(),
      message_sid: generateUUID(),
      contact_id: 'test_contact',
      message_type: 'text',
      user_id: 'default_user'
    };
    
    console.log('📝 Intentando insertar mensaje de prueba:', testMessage);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/whatsapp_messages`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log('📡 Respuesta de Supabase:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ Mensaje insertado correctamente en Supabase');
    } else {
      const errorText = await response.text();
      console.error('❌ Error insertando en Supabase:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Error verificando conexión a Supabase:', error);
  }
};

testSupabaseConnection(); 