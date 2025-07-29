# 🔧 Configuración de Twilio para Vercel

## 🚀 **URLs de Producción**

### 📱 **Webhook URLs para Twilio**
Una vez que el deploy esté completo, necesitarás configurar estas URLs en tu cuenta de Twilio:

#### 1️⃣ **Webhook Principal**
```
https://tu-app.vercel.app/api/whatsapp/twilio/webhook
```

#### 2️⃣ **URLs de API**
```
https://tu-app.vercel.app/api/whatsapp/send
https://tu-app.vercel.app/api/whatsapp/status
https://tu-app.vercel.app/api/whatsapp/config
```

## ⚙️ **Configuración en Twilio Console**

### 📋 **Pasos para Configurar Webhooks**

1. **Acceder a Twilio Console**
   - Ve a https://console.twilio.com/
   - Inicia sesión con tu cuenta

2. **Configurar WhatsApp Sandbox**
   - Ve a Messaging → Try it out → Send a WhatsApp message
   - O ve a Messaging → Settings → WhatsApp sandbox settings

3. **Configurar Webhook URL**
   - En "When a message comes in", pon: `https://tu-app.vercel.app/api/whatsapp/twilio/webhook`
   - Método: `POST`
   - Content Type: `application/x-www-form-urlencoded`

4. **Configurar Status Callback**
   - En "Status callback URL", pon: `https://tu-app.vercel.app/api/whatsapp/status-callback`
   - Método: `POST`

## 🔐 **Variables de Entorno en Vercel**

### 📝 **Variables Necesarias**
Configura estas variables en tu proyecto de Vercel:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_PHONE_NUMBER=+14155238886

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jyalmdhyuftjldewbfzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# App Configuration
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

## 🎯 **Configuración de Vercel**

### 📋 **vercel.json**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/whatsapp/twilio/webhook/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔄 **Proceso de Deploy**

### ✅ **Pasos para Deploy Exitoso**

1. **Commit y Push**
   ```bash
   git add .
   git commit -m "🚀 Deploy final con configuración de webhooks"
   git push
   ```

2. **Verificar Deploy en Vercel**
   - Ve a tu dashboard de Vercel
   - Verifica que el build sea exitoso
   - Obtén la URL de producción

3. **Configurar Variables de Entorno**
   - En Vercel Dashboard → Settings → Environment Variables
   - Agrega todas las variables necesarias

4. **Configurar Webhooks en Twilio**
   - Usa la URL de producción en lugar de localhost
   - Verifica que los webhooks funcionen

## 🧪 **Testing de Webhooks**

### 📱 **Probar Webhook de Twilio**
```bash
# Test con curl
curl -X POST https://tu-app.vercel.app/api/whatsapp/twilio/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+5491135562673&Body=test&MessageSid=test123"
```

### 🔍 **Verificar Status**
```bash
# Verificar estado del servicio
curl https://tu-app.vercel.app/api/whatsapp/status
```

## ⚠️ **Consideraciones Importantes**

### 🔒 **Seguridad**
- **Variables de entorno**: Nunca commits credenciales
- **Webhook validation**: Twilio valida las firmas automáticamente
- **HTTPS**: Vercel proporciona HTTPS automáticamente

### 📊 **Monitoreo**
- **Logs de Vercel**: Revisa los logs para debugging
- **Twilio Console**: Monitorea los webhooks en tiempo real
- **Supabase**: Verifica que los mensajes se guarden correctamente

### 🚀 **Optimizaciones**
- **Cold starts**: Las funciones serverless pueden tener latencia inicial
- **Timeout**: Configurado a 30 segundos para webhooks
- **Caching**: Considera implementar cache para mejorar rendimiento

## ✅ **Checklist de Deploy**

- [ ] **Código compilado sin errores**
- [ ] **Variables de entorno configuradas en Vercel**
- [ ] **Webhook URLs actualizadas en Twilio**
- [ ] **Status callback configurado**
- [ ] **Testing de webhooks realizado**
- [ ] **Mensajes enviados y recibidos correctamente**
- [ ] **Base de datos funcionando en producción**

## 🎯 **URLs Finales**

Una vez desplegado, tu aplicación estará disponible en:
```
https://tu-app.vercel.app
```

Y los webhooks de Twilio deberán apuntar a:
```
https://tu-app.vercel.app/api/whatsapp/twilio/webhook
```