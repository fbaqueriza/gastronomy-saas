# Guía para configurar WhatsApp Sandbox en Twilio

## Paso 1: Obtener el número de Sandbox
1. Ve a https://console.twilio.com
2. Ve a **Messaging > Try it out > Send a WhatsApp message**
3. Ahí verás el número de sandbox (ej: +14155238886)
4. También verás el código de activación

## Paso 2: Activar WhatsApp Sandbox
1. En tu WhatsApp, envía el código de activación al número de sandbox
2. Ejemplo: Si el código es "join abc-def", envía "join abc-def" al +14155238886
3. Recibirás una confirmación de que estás conectado al sandbox

## Paso 3: Actualizar el .env.local
Cambia esta línea en tu .env.local:
```
TWILIO_PHONE_NUMBER=+13259392697
```
Por el número de sandbox:
```
TWILIO_PHONE_NUMBER=+14155238886
```

## Paso 4: Probar el sistema
1. Reinicia el servidor: `npm run dev`
2. Prueba enviar un mensaje desde la aplicación
3. Debería llegar a tu WhatsApp

## Notas importantes:
- El sandbox solo funciona con números que hayas activado
- Para producción necesitarás un número real con WhatsApp habilitado
- El sandbox es perfecto para desarrollo y pruebas 