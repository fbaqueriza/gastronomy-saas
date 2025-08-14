import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// POST: Recibir notificación push de Google
export async function POST(request: NextRequest) {
  try {
    console.log('📱 POST /api/whatsapp/push-notification - Recibiendo notificación push...');
    
    const body = await request.json();
    console.log('📋 Push notification body:', JSON.stringify(body, null, 2));

    // Verificar que es una notificación de WhatsApp
    if (body.message?.data) {
      const messageData = JSON.parse(atob(body.message.data));
      console.log('📨 Mensaje decodificado:', messageData);

      // Procesar el mensaje de WhatsApp
      if (messageData.type === 'whatsapp_message') {
        console.log('✅ Notificación push de WhatsApp procesada correctamente');
        
        // Aquí podrías enviar la notificación a todos los clientes conectados
        // Por ahora solo logueamos la información
        
        return NextResponse.json({ 
          success: true, 
          message: 'Push notification procesada',
          data: messageData
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notificación push recibida (no es de WhatsApp)'
    });

  } catch (error) {
    console.error('💥 Error procesando push notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error procesando notificación push' 
    }, { status: 500 });
  }
}

// GET: Configurar suscripción a push notifications
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 GET /api/whatsapp/push-notification - Configurando suscripción...');
    
    // Retornar información de configuración para push notifications
    return NextResponse.json({ 
      success: true, 
      message: 'Endpoint de push notifications configurado',
      config: {
        vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'demo-key',
        supported: true
      }
    });

  } catch (error) {
    console.error('💥 Error configurando push notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error configurando push notifications' 
    }, { status: 500 });
  }
}
