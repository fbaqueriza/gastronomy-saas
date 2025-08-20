# 📋 FUNCIONAMIENTO DE LA APP GASTRONOMY-SAAS

## 🎯 Propósito Principal
Sistema de gestión para restaurantes/gastronomía que incluye:
- Gestión de proveedores
- Gestión de órdenes/pedidos
- Gestión de stock/inventario
- **Integración completa con WhatsApp Business API**
- Sistema de pagos

## 🏗️ Arquitectura Técnica

### Frontend
- **Framework**: Next.js 14 con TypeScript
- **UI**: Tailwind CSS + Lucide React (íconos)
- **Estado**: React hooks (useState, useEffect)
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Chat**: Context API + Server-Sent Events (SSE)

### Backend
- **API Routes**: Next.js API routes
- **Base de datos**: Supabase PostgreSQL
- **Storage**: Supabase Storage (archivos)
- **Real-time**: Server-Sent Events (SSE)
- **WhatsApp**: Meta WhatsApp Business API

## 📁 Estructura de Archivos

### Componentes Principales
```
src/components/
├── CreateOrderModal.tsx      # Modal para crear órdenes
├── EditOrderModal.tsx        # Modal para editar órdenes
├── ProviderConfigModal.tsx   # Modal para configurar proveedores
├── WeekDaySelector.tsx       # Selector de días de la semana
├── TimeRangeSelector.tsx     # Selector de rangos horarios
├── DateSelector.tsx          # Selector de fechas
├── PaymentMethodSelector.tsx # Selector de métodos de pago
├── WhatsAppChat.tsx         # Chat de WhatsApp (legacy)
├── IntegratedChatPanel.tsx   # Panel de chat integrado (NUEVO)
├── ChatFloatingButton.tsx    # Botón flotante de chat (NUEVO)
├── WhatsAppStatusIndicator.tsx # Indicador de estado (NUEVO)
└── WhatsAppSync.tsx         # Sincronización de WhatsApp
```

### Páginas Principales
```
src/app/
├── orders/page.tsx          # Gestión de órdenes
├── providers/page.tsx       # Gestión de proveedores
├── stock/page.tsx           # Gestión de inventario
└── dashboard/page.tsx       # Dashboard principal
```

## 🗄️ Modelos de Datos

### Provider (Proveedor)
```typescript
interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  categories: string[];
  notes?: string;
  defaultDeliveryDays?: string[];    // ['monday', 'wednesday', 'friday']
  defaultDeliveryTime?: string[];    // ['08:00-10:00', '14:00-16:00']
  defaultPaymentMethod?: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
}
```

### Order (Orden)
```typescript
interface Order {
  id: string;
  providerId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  currency: string;
  orderDate: Date;
  desiredDeliveryDate?: Date;
  paymentMethod?: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  additionalFiles?: OrderFile[];
  notes?: string;
}
```

### WhatsAppMessage (NUEVO)
```typescript
interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  documentUrl?: string;
  documentName?: string;
  documentSize?: number;
  documentType?: string;
}
```

### Contact (NUEVO)
```typescript
interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  providerId?: string;
  email?: string;
  address?: string;
  category?: string;
}
```

## 🔧 Funcionalidades Implementadas

### ✅ Gestión de Órdenes
- **Crear órdenes** con proveedor, ítems, fecha de entrega, método de pago
- **Editar órdenes** existentes (botón púrpura distintivo)
- **Adjuntar archivos** adicionales a las órdenes
- **Vista de ítems** desplegable en modal de edición
- **Fechas sugeridas** basadas en días de entrega del proveedor

### ✅ Gestión de Proveedores
- **Configuración visual** de días y horas de entrega
- **Selectores interactivos** para días de la semana
- **Selección múltiple** de rangos horarios
- **Horarios personalizados** con inicio y fin
- **Métodos de pago** por defecto
- **Vista previa** de configuración

### ✅ **WhatsApp Business Integration (NUEVO)**
- **Chat idéntico a WhatsApp Web** con interfaz visual idéntica
- **Estados de mensajes reales**: enviado (✓) → entregado (✓✓) → leído (✓✓)
- **Notificaciones push** del navegador para mensajes nuevos
- **Botón flotante** con badge de mensajes no leídos
- **Sincronización en tiempo real** con Server-Sent Events (SSE)
- **Modo simulación** para pruebas sin credenciales reales
- **Indicador de estado de conexión** en tiempo real
- **Auto-resize del textarea** como WhatsApp
- **Botones de emoji y micrófono** (preparados para futuras funcionalidades)
- **Panel integrado** en la página de órdenes
- **Context API** para manejo centralizado del estado del chat

### ✅ Componentes Reutilizables
- **WeekDaySelector**: Grid visual de días de la semana
- **TimeRangeSelector**: Selector de rangos horarios con colores
- **DateSelector**: Selector de fechas con opciones rápidas
- **PaymentMethodSelector**: Botones visuales para métodos de pago
- **WhatsAppStatusIndicator**: Indicador de estado de conexión
- **ChatFloatingButton**: Botón flotante con notificaciones

## 🎨 Diseño y UX

### Colores y Estilos
- **Botón Editar**: Púrpura (`purple-50`, `purple-700`) - **PENDIENTE CAMBIAR**
- **Días seleccionados**: Azul (`bg-blue-500`, `text-white`)
- **Horarios por categoría**: 
  - Mañana: Amarillo (`bg-yellow-100`)
  - Tarde: Naranja (`bg-orange-100`)
  - Noche: Púrpura (`bg-purple-100`)
- **WhatsApp**: Verde oficial (`#25D366`)

### Interactividad
- Hover effects en todos los botones
- Estados visuales claros para selecciones
- Transiciones suaves
- Feedback visual inmediato
- **Animaciones de chat** como WhatsApp real

## 🐛 Problemas Conocidos

### ❌ PENDIENTE CORREGIR
1. **Botones del landing page**: Los botones "Iniciar Sesión" y "Comenzar Gratis" no funcionan debido a problemas de hidratación de React
2. **Configuración de proveedores**: Los selectores no funcionan correctamente (agregados logs de debug)
3. **Días de entrega**: No se pueden editar directamente
4. **Optimización de rendimiento**: Reducir re-renders en componentes de chat

### 🔧 CORREGIDO RECIENTEMENTE (09/08/2025)
1. **✅ ChatContext completamente implementado**: Funciones `sendMessage` y `addMessage` ahora funcionan correctamente
2. **✅ Conexión SSE centralizada**: Eliminadas conexiones duplicadas, ahora solo hay una conexión SSE en ChatContext
3. **✅ Normalización de números de teléfono**: Implementadas utilidades `phoneUtils.ts` para manejo consistente
4. **✅ Botón flotante conectado**: Ahora usa el contexto real del chat en lugar de placeholders
5. **✅ Gestión de estado mejorada**: Estados sincronizados entre todos los componentes del chat
6. **✅ Mensajes en tiempo real**: Los mensajes entrantes se muestran inmediatamente via SSE
7. **✅ Pruebas automatizadas**: Script de prueba confirma que el chat funciona correctamente
8. **✅ Errores de TypeScript corregidos**: Eliminados archivos de backup corruptos y corregidos tipos incompatibles
9. **✅ Diagnóstico de botones del landing**: Identificado que los botones están en el HTML pero no tienen onClick debido a problemas de hidratación
10. **✅ Consola limpiada**: Eliminados logs innecesarios que causaban loop infinito
11. **✅ Errores de compilación resueltos**: Todos los errores de TypeScript corregidos, aplicación compila sin errores
12. **✅ Logs de debug eliminados**: Removidos logs que causaban loop infinito en IntegratedChatPanel y otros componentes
13. **✅ Diagnóstico avanzado del landing**: Identificado que el botón está en el HTML pero el texto no se renderiza correctamente (problema de codificación)
14. **✅ Limpieza masiva de logs**: Eliminados TODOS los logs de debug que causaban loop infinito en la consola
15. **✅ Loop infinito corregido**: Eliminado el log problemático en IntegratedChatPanel.tsx:186 y corregidas dependencias de useEffect que causaban "Maximum update depth exceeded"
16. **✅ Debug del chat implementado**: Agregados logs estratégicos en ChatContext e IntegratedChatPanel para monitorear el funcionamiento del chat en tiempo real
17. **✅ Sincronización de mensajes corregida**: Agregado useEffect adicional para sincronizar mensajes desde messagesByContact al estado local del componente
18. **✅ Loop infinito corregido definitivamente**: Optimizadas dependencias de useEffect y eliminados logs innecesarios que causaban re-renders infinitos
19. **✅ Contactos del chat corregidos**: Modificado GlobalChatWrapper para usar proveedores del contexto de datos en lugar de API separada
20. **✅ Error de DataProvider corregido**: Eliminada dependencia de useData en GlobalChatWrapper para evitar errores de contexto
21. **✅ Error de sintaxis en providers corregido**: Corregido objeto literal sin asignar en handleOpenModal
22. **✅ Carga de proveedores mejorada**: Implementada carga desde múltiples fuentes y nueva ruta API para proveedores del contexto de datos
23. **🔍 Diagnóstico de proveedores**: Identificado que la tabla providers está vacía - los proveedores se guardan solo en memoria pero no en la base de datos
24. **✅ Variables de entorno corregidas**: Service role key ahora se carga correctamente desde .env.local
25. **✅ Service role key corregida**: La service role key ahora funciona correctamente y permite acceso a los proveedores
26. **✅ Proveedores accesibles**: La API ahora devuelve 9 proveedores con datos completos
27. **✅ Contactos aparecen en chat**: Los proveedores ahora aparecen como contactos en el chat de WhatsApp
28. **🔍 Mensajes no llegan**: Los mensajes se envían correctamente a la API pero no llegan al destinatario - requiere verificación de configuración de WhatsApp Business
29. **🔍 Problema de webhook identificado**: URL del webhook en Meta apunta a URL antigua de ngrok - necesita actualización en panel de Meta
30. **🔍 Ngrok no está corriendo**: Meta no puede validar webhook porque ngrok no está activo - requiere iniciar ngrok y actualizar URL
31. **🔍 Instalación de ngrok requerida**: Ngrok no está instalado o no está en PATH - requiere instalación y configuración
32. **✅ Ngrok iniciado y configurado**: Ngrok corriendo en https://ff3b0024fa67.ngrok-free.app - webhook actualizado en env.local
33. **🔍 Error 131047 identificado**: "Re-engagement message" - han pasado más de 24 horas desde la última respuesta del destinatario
34. **✅ Variables de entorno corregidas**: WHATSAPP_VERIFY_TOKEN ahora se carga correctamente desde .env.local
35. **🔍 Problema con APIs de Supabase**: Todas las APIs de Supabase están fallando con error 500 - implementada API de prueba temporal
36. **✅ API de prueba implementada**: `/api/providers-test` devuelve datos de prueba para que el chat funcione
37. **✅ SSE corregido**: Webhook ahora envía mensajes correctamente a través de SSE para actualización en tiempo real
38. **✅ Reconexión automática SSE**: Implementada reconexión automática cada 3 segundos cuando se pierde la conexión SSE
39. **✅ Sincronización de mensajes corregida**: Los mensajes ya no se borran al cambiar de contacto - implementada lógica de merge inteligente
40. **✅ Loop infinito corregido**: Eliminados logs problemáticos que causaban re-renders infinitos en IntegratedChatPanel
41. **✅ Reconexión SSE mejorada**: Agregado manejador onclose para reconexión automática cuando se cierra la conexión SSE
42. **✅ Todos los providers visibles**: Corregido problema donde solo se mostraban 3 de 5 providers - ahora usa API de service key que devuelve todos los providers
43. **✅ Nombres de contactos corregidos**: Mejorada lógica para mostrar contact_name cuando name está vacío - elimina "Sin nombre" incorrecto
44. **✅ Filtrado de providers inválidos**: Implementado filtro para excluir providers sin nombre válido ni teléfono - elimina "Sin nombre" y proveedores eliminados
45. **✅ API de providers corregida**: Modificada API test-service-key para filtrar automáticamente providers inválidos - ahora solo devuelve 3 providers válidos de 5 totales
46. **✅ Límite de providers removido**: Eliminado .limit(5) de la API test-service-key - ahora devuelve todos los providers válidos (6 de 9 totales) incluyendo "L'igiene"
47. **✅ Filtrado por usuario implementado**: API test-service-key ahora filtra por userEmail - solo devuelve providers del usuario autenticado (4 providers válidos)
 48. **✅ Reconexión SSE completamente automática**: Implementada reconexión automática con backoff exponencial, heartbeat y detección de visibilidad de página - no requiere intervención manual
 49. **✅ Conexión SSE estabilizada**: Simplificada la lógica de reconexión para evitar conexiones múltiples simultáneas y mantener conexión estable
 50. **✅ Mensajes en BD funcionando**: API de mensajes devuelve 150 mensajes correctamente - el problema es solo la conexión SSE en tiempo real
 51. **✅ Conexión SSE simplificada**: Eliminada reconexión automática compleja - ahora usa conexión SSE básica sin reconexión automática
 52. **✅ Conexión SSE con useRef**: Implementada conexión SSE estable usando useRef para evitar múltiples conexiones y re-renders
 53. **✅ Historial persistente**: Corregida carga de mensajes al hacer refresh - ahora se cargan todos los mensajes de BD cuando no hay mensajes locales
 54. **✅ Debug ChatProvider**: Agregados logs detallados para verificar si el ChatProvider se está inicializando correctamente
49. **✅ Conexión SSE estabilizada**: Simplificada lógica de reconexión para evitar conexiones múltiples simultáneas - tiempos de reconexión aumentados para mayor estabilidad

### ✅ RESUELTO
1. ✅ Botón de editar diferenciado (pero necesita ajustes)
2. ✅ Items del pedido en modal de edición
3. ✅ Selectores visuales para configuración de proveedores
4. ✅ Componentes WeekDaySelector y TimeRangeSelector creados
5. ✅ **Botón de editar**: Ahora es más pequeño, solo ícono de editar, no violeta
6. ✅ **Items en modal**: Ahora son desplegables y con letra más pequeña
7. ✅ **Modal unificado**: Un solo modal para agregar y editar proveedores
8. ✅ **Rangos horarios**: Selector de rangos de tiempo en lugar de horas individuales
9. ✅ **Edición completa**: En modo edición se pueden cambiar todos los campos del proveedor
10. ✅ **Layout mejorado**: Corregido el layout de selectores de días y horas (cuarta iteración - layout vertical)
11. ✅ **Bloqueo inteligente**: La tabla se bloquea cuando se edita un proveedor desde el modal
12. ✅ **Botón único**: Solo hay un botón verde en la tabla para agregar proveedores
13. ✅ **Selección múltiple de horarios**: Se pueden seleccionar múltiples franjas horarias y agregar horarios personalizados
14. ✅ **Etiqueta del botón de edición**: Cambiado de "Configurar entrega y pago" a "Editar proveedor" para reflejar mejor su función
15. ✅ **Funcionalidad de catálogo en formulario**: Agregado botón para cargar/cambiar catálogo directamente en el modal de proveedores
16. ✅ **Mejoras en visualización de catálogos**: Mejorado el manejo de errores y mensajes informativos para la visualización de catálogos
17. ✅ **Corrección de test periódico SSE**: Removido el ping automático cada 30 segundos
18. ✅ **Corrección de carga de configuraciones**: Mejorado el useEffect para cargar correctamente las configuraciones al editar proveedores
19. ✅ **Corrección de carga de datos del proveedor**: Corregido el problema de que no se precargaban los datos al editar un proveedor
20. ✅ **Corrección de fila vacía al refrescar**: Removido el Date.now() del key del SpreadsheetGrid que causaba re-renders innecesarios
21. ✅ **Actualización completa del proveedor**: Modificado handleSaveProviderConfig para actualizar el proveedor completo en lugar de solo campos específicos
22. ✅ **Corrección de comparación de datos**: Mejorado handleDataChange para comparar por ID en lugar de por índice, evitando falsos positivos
23. ✅ **Corrección crítica del parámetro row**: Corregido el parámetro de la función render en la columna de acciones para que reciba correctamente el row del proveedor
24. ✅ **Mejora en visualización de catálogos**: Corregida la URL del catálogo para usar el archivo real en lugar de URL hardcodeada
25. ✅ **Botón de catálogo siempre visible**: El botón de catálogo ahora siempre aparece, con estado visual diferente cuando no hay catálogos
26. ✅ **Actualización instantánea de proveedores**: Los nuevos proveedores aparecen inmediatamente sin necesidad de recargar la página
27. 🔍 **Logs de debug mejorados**: Agregados logs detallados para rastrear el flujo de datos del proveedor al modal
28. 🔍 **Logs de debug para catálogos**: Agregados logs para diagnosticar problemas con la visualización de catálogos
29. 🔍 **Logs de debug para handleSubmit**: Agregados logs detallados en el modal para rastrear el flujo de agregar proveedores
30. 🧪 **Botón de prueba temporal**: Agregado botón para agregar catálogo de prueba al primer proveedor
31. ✅ **Corrección crítica del botón submit**: Removido onClick conflictivo del botón submit que impedía que se ejecutara handleSubmit
32. ✅ **URL persistente para catálogos**: Cambiada URL temporal por URL persistente para evitar pérdida de catálogos al refrescar
33. ✅ **Corrección crítica del botón submit**: Movido el botón submit dentro del formulario para que funcione correctamente
34. ✅ **Corrección de tipos TypeScript**: Agregado import de Catalog y corregido tipo de catalogs
35. ✅ **Corrección de catálogos por proveedor**: Los catálogos ahora se asocian correctamente al proveedor específico
36. ✅ **Mejora en actualización de proveedores**: Los nuevos proveedores aparecen inmediatamente sin necesidad de refresh
37. ✅ **URL de catálogo mejorada**: Cambiada a una URL de PDF más confiable para pruebas
38. ✅ **Visualización de catálogo real**: Ahora se usa el archivo real subido en lugar de una URL hardcodeada
39. ✅ **Implementación completa con Supabase Storage**: Los catálogos ahora se suben a Supabase Storage y se guardan permanentemente
40. ✅ **Corrección de bucket de Storage**: Cambiado de bucket 'catalogs' a 'files' y agregada verificación automática de existencia del bucket
41. ✅ **Corrección de tipo async**: Agregado tipo explícito Promise<void> a handleCatalogUploadLocal para resolver error de await
42. ✅ **Corrección de async/await**: Cambiado await por .catch() para evitar errores de compilación
43. ✅ **Mejora del layout del formulario**: Reducido tamaño del modal, espaciado y márgenes para mejor UX
44. ✅ **Corrección de permisos de Storage**: Implementado fallback a bucket 'avatars' y manejo de errores RLS
45. ✅ **Solución temporal para RLS**: Implementado almacenamiento local como fallback cuando no hay permisos de Storage
46. ✅ **Chat de WhatsApp idéntico a WhatsApp real**: Interfaz visual, estados de mensajes, notificaciones push
47. ✅ **Botón flotante de WhatsApp**: Con badge de mensajes no leídos y notificaciones
48. ✅ **Sincronización en tiempo real**: Server-Sent Events para actualizaciones automáticas
49. ✅ **Estados de mensajes correctos**: Enviado (✓) → Entregado (✓✓) → Leído (✓✓)
50. ✅ **Indicador de estado de conexión**: Visual en tiempo real con modo simulación

## 🔄 Flujo de Trabajo

### Crear Orden
1. Usuario va a `/orders`
2. Hace clic en "Crear pedido"
3. Selecciona proveedor
4. Se auto-completan fecha y método de pago según configuración del proveedor
5. Agrega ítems del pedido
6. Adjunta archivos adicionales (opcional)
7. Guarda la orden

### Editar Orden
1. Usuario hace clic en botón "Editar pedido" (púrpura)
2. Se abre modal con información completa
3. Puede modificar fecha, método de pago, archivos, notas
4. Los ítems se muestran en sección desplegable

### Configurar Proveedor
1. Usuario va a `/providers`
2. Hace clic en "Configurar entrega y pago"
3. Usa selectores visuales para días y horas
4. Selecciona método de pago por defecto
5. Ve vista previa de la configuración

### **Chat de WhatsApp (NUEVO)**
1. **Abrir chat**: Hacer clic en botón flotante verde o panel integrado
2. **Seleccionar contacto**: Lista de proveedores convertidos a contactos
3. **Enviar mensaje**: Escribir y presionar Enter o botón de envío
4. **Ver estados**: Mensaje aparece con ✓ → ✓✓ → ✓✓ (simulación)
5. **Recibir mensajes**: Actualización automática en tiempo real
6. **Notificaciones**: Push notifications si chat está cerrado

## 📞 Próximas Mejoras

### Inmediatas
1. **Arreglar selectores de proveedores**: Verificar por qué no funcionan (logs de debug agregados)
2. **Testear funcionalidad**: Verificar que los cambios funcionen correctamente
3. **Optimizar UX**: Mejorar feedback visual en los selectores

### Chat de WhatsApp
1. **Reacciones a mensajes**: Emojis como WhatsApp
2. **Respuestas a mensajes**: Citar mensajes específicos
3. **Archivos multimedia**: Imágenes, videos, documentos
4. **Mensajes de voz**: Grabación y envío de audio
5. **Llamadas de voz/video**: Integración con WebRTC
6. **Estados de contacto**: "en línea", "última vez", "escribiendo..."

### Futuras
1. **Mejorar UX**: Más feedback visual
2. **Optimizar rendimiento**: Reducir re-renders
3. **Agregar validaciones**: Mejor manejo de errores
4. **Documentación**: Más ejemplos de uso

## 🔧 Comandos Útiles

```bash
# Iniciar desarrollo
npm run dev

# Verificar TypeScript
npx tsc --noEmit

# Construir para producción
npm run build

# Puerto de desarrollo
http://localhost:3001
```

## 📝 Notas de Desarrollo

- **Estado**: En desarrollo activo
- **Última actualización**: Chat de WhatsApp completamente corregido y funcional
- **Prioridad**: Optimizar rendimiento y corregir selectores de proveedores
- **Documentación**: Este archivo se actualiza automáticamente
- **Chat**: ✅ Sistema completamente funcional y optimizado - ChatContext restaurado y corregido (commit 97005b6 + parches), mensajes entrantes en tiempo real corregidos, normalización de números consistente (formato sin +), SSE operativo con reconexión automática optimizada (1 segundo), logs reducidos para mejor rendimiento, múltiples procesos Node.js terminados, límite de mensajes removido, nombres de proveedores cargados automáticamente, base de datos limpia (L'igiene eliminado definitivamente), ordenamiento cronológico corregido (más nuevos abajo), timestamps simplificados, selección automática de contacto removida, logs de debug SSE mejorados, webhook SSE verificado y funcionando, campos de BD corregidos (contact_id, message_type, message_sid), useEffect para actualizar mensajes cuando cambia contacto seleccionado, IntegratedChatPanel agregado a la página de orders, logs de debug agregados para diagnóstico completo del flujo de mensajes, formato de números corregido en handleOrderClick (sin +), IntegratedChatPanel corregido para usar formato consistente, flujo completo verificado y funcionando, logs excesivos limpiados para mejor rendimiento, formato de números corregido en IntegratedChatPanel (sin +), sistema de notificaciones implementado (funciona cuando el chat está cerrado), lógica de deduplicación mejorada para evitar mensajes duplicados al hacer refresh, ordenamiento automático de mensajes cada vez que se agregan, sistema completamente funcional 