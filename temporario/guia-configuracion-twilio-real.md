# 🔧 Guía para Configurar Twilio Real

## ❌ **Problema Actual**
Las credenciales de Twilio actuales no son válidas:
- **Error:** 401 Unauthorized
- **Código:** 20003 (Authenticate)
- **Estado:** Modo simulación activado

## ✅ **Pasos para Configurar Twilio Real**

### 1️⃣ **Obtener Credenciales Válidas de Twilio**

#### A. Crear cuenta en Twilio
1. Ve a [https://www.twilio.com](https://www.twilio.com)
2. Crea una cuenta gratuita
3. Verifica tu número de teléfono

#### B. Obtener credenciales
1. Ve al [Console de Twilio](https://console.twilio.com/)
2. Copia tu **Account SID** y **Auth Token**
3. Ve a **Messaging > Try it out > Send a WhatsApp message**
4. Configura tu número de WhatsApp Business API

### 2️⃣ **Configurar WhatsApp Business API**

#### A. Número de WhatsApp Business
1. En Twilio Console, ve a **Messaging > Senders**
2. Agrega tu número de WhatsApp Business
3. Sigue el proceso de verificación

#### B. Configurar webhook
1. Ve a **Messaging > Settings > WhatsApp Senders**
2. Configura el webhook URL: `https://tu-dominio.vercel.app/api/whatsapp/twilio/webhook`

### 3️⃣ **Actualizar Variables de Entorno**

Reemplaza las credenciales en `.env.local`:

```bash
# Twilio WhatsApp Configuration (REEMPLAZAR CON CREDENCIALES REALES)
TWILIO_ACCOUNT_SID=tu_account_sid_real_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_real_aqui
TWILIO_PHONE_NUMBER=+14155238886  # Tu número de WhatsApp Business
```

### 4️⃣ **Verificar Configuración**

Una vez configurado, ejecuta:

```bash
node temporario/verify-twilio-credentials.js
```

Deberías ver:
- ✅ Autenticación exitosa con Twilio
- ✅ Mensaje enviado exitosamente a Twilio

### 5️⃣ **Probar en el Sistema**

```bash
# Probar envío de mensaje real
node temporario/test-twilio-real.js
```

## 🔍 **Diagnóstico de Credenciales**

### ✅ **Credenciales Válidas**
- Account SID: Empieza con `AC`
- Auth Token: 32 caracteres alfanuméricos
- Respuesta de API: 200 OK

### ❌ **Credenciales Inválidas**
- Error 401 Unauthorized
- Código 20003 (Authenticate)
- Sistema en modo simulación

## 📱 **Configuración de WhatsApp Business**

### Requisitos:
1. **Número de teléfono verificado**
2. **Cuenta de WhatsApp Business**
3. **Aprobación de Twilio para WhatsApp**

### Proceso:
1. Solicitar acceso a WhatsApp Business API
2. Verificar número de teléfono
3. Configurar webhook para recibir mensajes
4. Probar envío de mensajes

## 🚀 **Una Vez Configurado**

### Verificar que funciona:
```bash
# 1. Verificar estado
curl http://localhost:3001/api/whatsapp/status

# 2. Enviar mensaje real
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/send" -Method POST -ContentType "application/json" -Body '{"to":"+5491135562673","message":"Prueba real"}'

# 3. Verificar que llegó el mensaje a tu WhatsApp
```

### Resultado esperado:
- ✅ Modo: "production" (no "simulation")
- ✅ Message ID: Empieza con "MG" (no "sim_")
- ✅ Mensaje llega a tu WhatsApp

## ⚠️ **Notas Importantes**

1. **Cuenta gratuita de Twilio:**
   - Límite de mensajes por mes
   - Solo números verificados

2. **WhatsApp Business API:**
   - Requiere aprobación de Meta
   - Solo funciona con números verificados

3. **Webhook:**
   - Debe ser HTTPS en producción
   - Configurar en Twilio Console

## 🎯 **Próximos Pasos**

1. **Obtener credenciales reales de Twilio**
2. **Configurar WhatsApp Business API**
3. **Actualizar variables de entorno**
4. **Probar envío de mensajes reales**
5. **Verificar recepción de mensajes**

**¿Tienes credenciales reales de Twilio para configurar?** 