// Script para leer directamente el archivo .env.local
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  console.log('📁 Leyendo archivo:', envPath);
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('📋 Contenido del archivo .env.local:');
    console.log(content);
    
    // Parsear las variables
    const lines = content.split('\n').filter(line => line.trim());
    const envVars = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    console.log('\n🔍 Variables parseadas:');
    Object.keys(envVars).forEach(key => {
      console.log(`${key}: ${envVars[key] ? 'SET' : 'NOT_SET'}`);
    });
  } else {
    console.log('❌ El archivo .env.local no existe');
  }
} catch (error) {
  console.error('❌ Error leyendo archivo:', error);
} 