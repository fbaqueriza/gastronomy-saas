# Integración con Kapso

## 📋 Descripción

Este documento describe la integración implementada con la plataforma Kapso para mensajería y comunicación.

## 🏗️ Arquitectura

### Servicios implementados:

1. **`KapsoService`** (`src/lib/kapsoService.ts`)
   - Clase principal para manejar la comunicación con Kapso
   - Métodos para autenticación, envío de mensajes, sincronización de contactos
   - Manejo de webhooks para recibir mensajes

2. **Endpoints API**:
   - `/api/kapso/webhook` - Recibir webhooks de Kapso
   - `/api/kapso/send-message` - Enviar mensajes a través de Kapso
   - `/api/kapso/sync-contacts` - Sincronizar contactos con Kapso

3. **Componente UI** (`src/components/KapsoIntegration.tsx`)
   - Interfaz para gestionar la integración
   - Verificación de conexión
   - Envío de mensajes de prueba
   - Sincronización de contactos

## 🔧 Configuración

### Variables de entorno requeridas:

```env
KAPSO_API_KEY=tu_api_key_de_kapso
KAPSO_BASE_URL=https://api.kapso.com
```

### Instalación:

1. Agregar las variables de entorno al archivo `.env.local`
2. Configurar los webhooks en la plataforma Kapso apuntando a `/api/kapso/webhook`
3. Verificar la conexión desde la interfaz de administración

## 📡 Endpoints

### POST `/api/kapso/webhook`
Recibe webhooks de Kapso con nuevos mensajes.

**Body esperado:**
```json
{
  "type": "message",
  "contactId": "123456789",
  "content": "Hola mundo",
  "timestamp": "2025-08-20T19:00:00Z"
}
```

### POST `/api/kapso/send-message`
Envía un mensaje a través de Kapso.

**Body:**
```json
{
  "contactId": "123456789",
  "content": "Mensaje de prueba",
  "type": "text"
}
```

### POST `/api/kapso/sync-contacts`
Sincroniza contactos con Kapso.

**Body:**
```json
{
  "contacts": [
    {
      "phone": "+5491112345678",
      "name": "Cliente Test 1"
    }
  ]
}
```

## 🎯 Funcionalidades

### ✅ Implementadas:
- [x] Estructura base del servicio Kapso
- [x] Endpoints API para webhook, envío y sincronización
- [x] Componente UI para gestión
- [x] Integración en la navegación
- [x] Manejo de errores y estados de carga

### 🔄 Pendientes (requieren documentación de Kapso):
- [ ] Implementar autenticación real con la API de Kapso
- [ ] Configurar endpoints específicos según la documentación de Kapso
- [ ] Manejar tipos de mensajes específicos (imagen, audio, video)
- [ ] Implementar sincronización bidireccional de contactos
- [ ] Agregar manejo de estados de entrega de mensajes

## 🧪 Pruebas

### Verificar conexión:
```bash
curl http://localhost:3001/api/kapso/webhook
```

### Enviar mensaje de prueba:
```bash
curl -X POST http://localhost:3001/api/kapso/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "test123",
    "content": "Mensaje de prueba",
    "type": "text"
  }'
```

### Sincronizar contactos:
```bash
curl -X POST http://localhost:3001/api/kapso/sync-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {
        "phone": "+5491112345678",
        "name": "Cliente Test"
      }
    ]
  }'
```

## 📝 Notas importantes

1. **Configuración pendiente**: Esta implementación es una estructura base que requiere la documentación específica de la API de Kapso para completar la integración.

2. **Variables de entorno**: Asegúrate de configurar `KAPSO_API_KEY` y `KAPSO_BASE_URL` antes de usar la integración.

3. **Webhooks**: Configura el webhook en Kapso para que apunte a tu dominio + `/api/kapso/webhook`.

4. **Pruebas**: Usa la interfaz en `/kapso` para probar la integración antes de usar en producción.

## 🔗 Enlaces útiles

- [Página de integración](/kapso)
- [Documentación de la API de Kapso] (pendiente)
- [Configuración de webhooks] (pendiente)

---

**Estado**: 🟡 En desarrollo - Estructura base implementada, pendiente configuración específica de Kapso
