# Reporte de Diagnóstico - Corrección del Flujo de Pedidos

## Fecha: 24 de Agosto de 2025

## Problemas Identificados

### 1. Error de URL en el servidor
- **Problema:** `Failed to parse URL from /api/whatsapp/get-pending-order`
- **Causa:** Uso de URLs relativas en el servidor (webhook)
- **Solución:** Agregada variable `NEXT_PUBLIC_APP_URL` y uso de URLs absolutas

### 2. Mensajes no aparecen en el chat de la plataforma
- **Problema:** Los mensajes enviados y recibidos no se guardan en la base de datos
- **Causa:** Uso de credenciales anónimas de Supabase en lugar de service role
- **Solución:** Modificado `metaWhatsAppService.saveMessage()` para usar `SUPABASE_SERVICE_ROLE_KEY`

### 3. Tabla pending_orders no existía
- **Problema:** Error al intentar guardar pedidos pendientes
- **Causa:** La tabla `pending_orders` no estaba creada en Supabase
- **Solución:** Creada tabla con estructura completa e índices

## Cambios Realizados

### 1. Variables de Entorno
```bash
# Agregado a env.local
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Corrección de URLs en orderNotificationService.ts
```typescript
// Antes
const response = await fetch('/api/whatsapp/get-pending-order', ...);

// Después
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const response = await fetch(`${baseUrl}/api/whatsapp/get-pending-order`, ...);
```

### 3. Corrección de credenciales en metaWhatsAppService.ts
```typescript
// Antes
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Después
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### 4. Creación de tabla pending_orders
```sql
CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  provider_phone TEXT NOT NULL,
  order_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Nuevo Flujo Implementado

### 1. Envío de Pedido
1. Se envía solo el disparador (template) al proveedor
2. Se guarda el pedido en estado "pending_confirmation"
3. Se muestra en la interfaz de "Pedidos Pendientes"

### 2. Respuesta del Proveedor
1. El webhook detecta la respuesta
2. Automáticamente envía los detalles completos del pedido
3. Remueve el pedido de la lista de pendientes

### 3. Interfaz de Usuario
- Componente `PendingOrderList` muestra pedidos pendientes
- Botón para enviar detalles manualmente
- Botón para cancelar pedidos pendientes

## Endpoints Creados

- `POST /api/whatsapp/save-pending-order` - Guardar pedido pendiente
- `POST /api/whatsapp/get-pending-order` - Obtener pedido pendiente específico
- `GET /api/whatsapp/get-all-pending-orders` - Listar todos los pedidos pendientes
- `POST /api/whatsapp/remove-pending-order` - Remover pedido pendiente
- `POST /api/whatsapp/send-order-details` - Enviar detalles manualmente

## Estado Actual

✅ **Problemas corregidos:**
- URLs absolutas en el servidor
- Credenciales correctas de Supabase
- Tabla pending_orders creada
- Flujo de pedidos implementado

🔄 **Pendiente de verificación:**
- Funcionamiento completo del flujo
- Integración con el chat de la plataforma
- Persistencia de mensajes en tiempo real

## Nuevas Funcionalidades Agregadas

### Inicializador de Conversación (Actualizado)
- **Propósito:** Reiniciar la ventana de 24 horas de Meta WhatsApp
- **Cuándo usar:** Solo cuando han pasado 24 horas y no se pueden enviar mensajes manuales
- **Template:** `inicializador_de_conv`
- **Ubicación:** Banner prominente en el área de input (solo visible cuando es necesario)
- **Funcionalidad:** 
  - Detección automática de ventana de 24h expirada
  - Banner visual con explicación clara
  - Botón prominente "Reiniciar Conversación"
  - Deshabilita el input de mensajes cuando es necesario

### Botones en el Chat (Actualizados)
1. **Phone (📞):** Llamada (pendiente)
2. **Video (📹):** Videollamada (pendiente)
3. **More (⋮):** Más opciones (pendiente)
4. **Inicializador:** Solo aparece cuando han pasado 24 horas

## Próximos Pasos

1. Probar el envío de un pedido completo
2. Verificar que los mensajes aparezcan en el chat
3. Confirmar que el flujo automático funcione correctamente
4. Probar el inicializador de conversación
5. Optimizar la interfaz de usuario si es necesario
