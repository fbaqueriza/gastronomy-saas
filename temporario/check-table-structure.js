// Script para verificar la estructura de la tabla whatsapp_messages
const checkTableStructure = async () => {
  console.log('🔍 Verificando estructura de la tabla whatsapp_messages...');
  
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
    
    // Intentar insertar un mensaje de prueba con diferentes campos
    const testMessage = {
      id: 'test-structure-' + Date.now(),
      content: 'Mensaje de prueba para verificar estructura',
      timestamp: new Date().toISOString(),
      message_sid: 'test_sid_' + Date.now(),
      contact_id: 'test_contact',
      message_type: 'text',
      user_id: 'default_user',
      // Intentar agregar campo 'from'
      from: 'test_from_field'
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
      console.log('✅ Mensaje insertado correctamente - campo "from" existe');
    } else {
      const errorText = await response.text();
      console.error('❌ Error insertando en Supabase:', errorText);
      
      if (errorText.includes('from')) {
        console.log('💡 El campo "from" no existe en la tabla');
      }
    }
    
    // Intentar obtener información de la tabla
    console.log('\n📊 Intentando obtener información de la tabla...');
    const infoResponse = await fetch(`${supabaseUrl}/rest/v1/whatsapp_messages?select=*&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (infoResponse.ok) {
      const sampleData = await infoResponse.json();
      if (sampleData && sampleData.length > 0) {
        console.log('📋 Columnas disponibles en la tabla:');
        Object.keys(sampleData[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof sampleData[0][column]}`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Error verificando estructura de tabla:', error);
  }
  
  console.log('\n🏁 Verificación completada');
};

// Ejecutar verificación
checkTableStructure(); 