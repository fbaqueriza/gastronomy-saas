# Gastronomy SaaS - Plataforma de Gestión Gastronómica

Una plataforma completa para la gestión de proveedores, inventario, pedidos y pagos en el sector gastronómico, ahora con integración de WhatsApp e IA.

## 🚀 Características Principales

### Gestión de Negocio
- **Proveedores**: Gestión completa de proveedores con catálogos y información de contacto
- **Inventario**: Control de stock con alertas de reposición automática
- **Pedidos**: Sistema de pedidos integrado con proveedores
- **Pagos**: Seguimiento de pagos y facturación
- **Dashboard**: Panel de control con métricas y análisis

### WhatsApp + IA (NUEVO)
- **Integración WhatsApp Business API**: Conexión directa con Meta Cloud API
- **Análisis de IA**: Procesamiento inteligente de mensajes y documentos
- **Respuestas Automáticas**: Sistema de respuestas personalizables
- **Mensajes con Plantillas**: Soporte para plantillas de WhatsApp Business
- **Análisis de Documentos**: OCR para facturas, catálogos y recibos
- **Insights de Conversación**: Análisis de sentimiento y tendencias
- **Dashboard de WhatsApp**: Interfaz completa para gestión de conversaciones

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **WhatsApp**: Meta Cloud API (WhatsApp Business API)
- **IA**: OpenAI GPT-4, Azure Cognitive Services
- **OCR**: Azure Computer Vision / Google Cloud Vision

## 📋 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/gastronomy-saas.git
cd gastronomy-saas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# WhatsApp Business API (Meta)
WHATSAPP_API_KEY=tu_whatsapp_api_key
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id
WHATSAPP_WEBHOOK_URL=https://tu-dominio.com/api/whatsapp/webhook
WHATSAPP_VERIFY_TOKEN=tu_webhook_verify_token

# OpenAI (para análisis de IA)
OPENAI_API_KEY=tu_openai_api_key
OPENAI_MODEL=gpt-4

# Twilio (alternativa para WhatsApp)
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=tu_twilio_whatsapp_number

# Azure Cognitive Services (para OCR)
AZURE_COGNITIVE_SERVICES_KEY=tu_azure_key
AZURE_COGNITIVE_SERVICES_ENDPOINT=tu_azure_endpoint
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🔧 Configuración de WhatsApp

### Opción 1: Meta WhatsApp Business API
1. Crear cuenta en [Meta for Developers](https://developers.facebook.com/)
2. Configurar WhatsApp Business API
3. Obtener credenciales y configurar webhook

### Opción 2: Twilio WhatsApp
1. Crear cuenta en [Twilio](https://www.twilio.com/)
2. Activar WhatsApp Sandbox
3. Configurar credenciales en variables de entorno

## 🤖 Configuración de IA

### OpenAI
1. Crear cuenta en [OpenAI](https://openai.com/)
2. Obtener API key
3. Configurar en variables de entorno

### Azure Cognitive Services (OCR)
1. Crear recurso en Azure Portal
2. Obtener endpoint y key
3. Configurar en variables de entorno

## 📊 Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── whatsapp/          # WhatsApp + IA
│   │   ├── page.tsx      # Dashboard de WhatsApp
│   │   └── automated/     # Respuestas automáticas
│   └── api/              # API Routes
│       └── whatsapp/     # Webhooks de WhatsApp
├── components/            # Componentes React
│   ├── WhatsAppDashboard.tsx
│   ├── AutomatedResponseManager.tsx
│   └── ...
├── lib/                  # Servicios y utilidades
│   ├── whatsappService.ts
│   └── supabaseClient.ts
├── types/                # Tipos TypeScript
│   ├── whatsapp.ts      # Tipos de WhatsApp
│   └── index.ts         # Tipos generales
└── hooks/               # Custom hooks
```

## 🚀 Funcionalidades de WhatsApp + IA

### Análisis Inteligente
- **Detección de Intención**: Identifica si el cliente quiere hacer un pedido, consultar precios, etc.
- **Extracción de Entidades**: Detecta productos, cantidades, precios automáticamente
- **Análisis de Sentimiento**: Evalúa la satisfacción del cliente
- **Procesamiento de Documentos**: OCR para facturas y catálogos

### Respuestas Automáticas
- **Sistema de Triggers**: Palabras clave e intenciones
- **Respuestas Dinámicas**: Personalización con variables
- **Priorización**: Sistema de prioridades para respuestas
- **Escalación**: Derivación a agentes humanos cuando es necesario

### Dashboard de WhatsApp
- **Conversaciones en Tiempo Real**: Vista de todas las conversaciones
- **Estadísticas**: Métricas de rendimiento
- **Insights de IA**: Análisis de patrones y tendencias
- **Gestión de Respuestas**: Configuración de respuestas automáticas

## 📈 Métricas y Analytics

### WhatsApp
- Conversaciones activas
- Tiempo de respuesta promedio
- Porcentaje de respuestas automáticas
- Satisfacción del cliente

### IA
- Precisión del análisis
- Tasa de detección de intenciones
- Efectividad de respuestas automáticas
- Tendencias de sentimiento

## 🔒 Seguridad

- Autenticación con Supabase Auth
- Encriptación de mensajes
- Validación de webhooks
- Control de acceso por roles

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t gastronomy-saas .
docker run -p 3000:3000 gastronomy-saas
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre la integración de WhatsApp e IA, contacta:
- Email: soporte@gastronomy-saas.com
- WhatsApp: +54 9 11 1234-5678

## 🔄 Roadmap

- [ ] Integración con más proveedores de IA
- [ ] Análisis de voz en WhatsApp
- [ ] Chatbot avanzado con memoria de conversación
- [ ] Integración con sistemas de facturación
- [ ] App móvil nativa
- [ ] Multiidioma
- [ ] API pública para desarrolladores

## 🔄 Migración a Meta Cloud API

### ✅ Completado
- [x] Nuevo servicio de Meta Cloud API
- [x] Actualización de rutas de API
- [x] Soporte para mensajes con plantillas
- [x] Modo simulación para desarrollo
- [x] Documentación de migración

### 📋 Próximos Pasos
- [ ] Configurar credenciales reales de Meta
- [ ] Probar envío de mensajes con números reales
- [ ] Configurar webhook en Meta for Developers
- [ ] Eliminar dependencia de Twilio (opcional)
- [ ] Optimizar rendimiento del servicio

Para más detalles sobre la migración, consulta [MIGRATION_TWILIO_TO_META.md](MIGRATION_TWILIO_TO_META.md).
 