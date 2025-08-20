// Service Worker para push notifications de WhatsApp

const CACHE_NAME = 'whatsapp-chat-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/api/whatsapp/messages',
  '/api/whatsapp/push-notification'
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones fetch - DESHABILITADO TEMPORALMENTE
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request)
//       .then((response) => {
//         // Retornar desde cache si está disponible
//         if (response) {
//           return response;
//         }
//         
//         // Si no está en cache, hacer la petición a la red
//         return fetch(event.request);
//       }
//     )
//   );
// });

// Manejar push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification recibida');
  
  let notificationData = {
    title: 'Nuevo mensaje de WhatsApp',
    body: 'Tienes un nuevo mensaje',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'whatsapp-message',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📨 Service Worker: Datos de push notification:', data);
      
      if (data.type === 'whatsapp_message') {
        notificationData = {
          title: `Mensaje de ${data.contactName || 'Contacto'}`,
          body: data.content || 'Nuevo mensaje recibido',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'whatsapp-message',
          data: data,
          actions: [
            {
              action: 'open',
              title: 'Abrir chat'
            },
            {
              action: 'reply',
              title: 'Responder'
            }
          ]
        };
      }
    } catch (error) {
      console.error('❌ Service Worker: Error procesando datos de push:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notificación clickeada');
  
  event.notification.close();

  if (event.action === 'open' || event.action === '') {
    // Abrir la aplicación
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
    );
  } else if (event.action === 'reply') {
    // Abrir el chat directamente
    event.waitUntil(
      clients.openWindow('/dashboard?openChat=true')
    );
  }
});

// Manejar notificaciones cerradas
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Service Worker: Notificación cerrada');
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensaje recibido del cliente:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker: Cargado correctamente');
