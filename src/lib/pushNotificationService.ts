// Servicio para manejar push notifications de Google

interface PushNotificationConfig {
  vapidPublicKey: string;
  supported: boolean;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private config: PushNotificationConfig | null = null;

  // Verificar si las push notifications están soportadas
  async isSupported(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push notifications no soportadas en este navegador');
      return false;
    }
    return true;
  }

  // Obtener configuración del servidor
  async getConfig(): Promise<PushNotificationConfig | null> {
    try {
      const response = await fetch('/api/whatsapp/push-notification');
      const data = await response.json();
      
      if (data.success) {
        this.config = data.config;
        return this.config;
      }
    } catch (error) {
      console.error('Error obteniendo configuración de push notifications:', error);
    }
    return null;
  }

  // Registrar el service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.log('❌ Service Worker no soportado');
        return null;
      }

      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registrado:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  }

  // Suscribirse a push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        console.log('❌ Service Worker no registrado');
        return null;
      }

      if (!this.config) {
        console.log('❌ Configuración no disponible');
        return null;
      }

      // Verificar si ya existe una suscripción
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ Ya existe una suscripción a push notifications');
        return subscription;
      }

      // Crear nueva suscripción
      subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
      });

      console.log('✅ Suscripción a push notifications creada:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a push notifications:', error);
      return null;
    }
  }

  // Cancelar suscripción
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Suscripción a push notifications cancelada');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      return false;
    }
  }

  // Convertir VAPID key de base64 a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Solicitar permisos de notificación
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('❌ Notificaciones no soportadas');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permisos de notificación ya concedidos');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permisos de notificación denegados');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('🔔 Permiso de notificación:', permission);
    return permission;
  }

  // Mostrar notificación local
  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  // Inicializar el servicio
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Inicializando Push Notification Service...');

      // Verificar soporte
      if (!(await this.isSupported())) {
        return false;
      }

      // Obtener configuración
      if (!(await this.getConfig())) {
        return false;
      }

      // Registrar service worker
      if (!(await this.registerServiceWorker())) {
        return false;
      }

      // Solicitar permisos
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        console.log('❌ Permisos de notificación no concedidos');
        return false;
      }

      // Suscribirse a push notifications
      const subscription = await this.subscribeToPushNotifications();
      if (!subscription) {
        console.log('❌ No se pudo suscribir a push notifications');
        return false;
      }

      console.log('✅ Push Notification Service inicializado correctamente');
      return true;
    } catch (error) {
      console.error('Error inicializando Push Notification Service:', error);
      return false;
    }
  }
}

// Instancia global
export const pushNotificationService = new PushNotificationService();
