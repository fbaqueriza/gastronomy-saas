import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Verificar que las variables estén configuradas
if (!WHATSAPP_API_KEY || !PHONE_NUMBER_ID) {
  console.error('❌ Variables de entorno de WhatsApp no configuradas');
  console.error('WHATSAPP_API_KEY:', WHATSAPP_API_KEY ? 'Configurado' : 'No configurado');
  console.error('PHONE_NUMBER_ID:', PHONE_NUMBER_ID ? 'Configurado' : 'No configurado');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, template_name, template_params } = body;

    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere el parámetro "to"'
      }, { status: 400 });
    }

    console.log('🚀 Disparando conversación de Meta:', { to, template_name });
    console.log('🔧 Configuración:', { 
      WHATSAPP_API_URL, 
      PHONE_NUMBER_ID: PHONE_NUMBER_ID ? 'Configurado' : 'No configurado',
      WHATSAPP_API_KEY: WHATSAPP_API_KEY ? 'Configurado' : 'No configurado'
    });

    // Si se especifica un template, usar la API de templates
    if (template_name) {
      const templatePayload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: template_name,
          language: {
            code: 'es_AR'
          },
          components: template_params && template_params.length > 0 ? [
            {
              type: 'body',
              parameters: template_params
            }
          ] : undefined
        }
      };

      const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templatePayload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error disparando template:', result);
        return NextResponse.json({
          success: false,
          error: 'Error disparando template de conversación',
          details: result
        }, { status: response.status });
      }

      console.log('✅ Template disparado exitosamente:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Conversación disparada exitosamente',
        data: result
      });
    }

    // Si no hay template ni mensaje, solo disparar la conversación
    if (!message) {
      // Solo disparar la conversación sin enviar mensaje
      console.log('✅ Conversación disparada exitosamente (sin mensaje)');
      return NextResponse.json({
        success: true,
        message: 'Conversación disparada exitosamente',
        data: { conversation_triggered: true }
      });
    }

    const messagePayload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error enviando mensaje:', result);
      return NextResponse.json({
        success: false,
        error: 'Error enviando mensaje',
        details: result
      }, { status: response.status });
    }

    console.log('✅ Mensaje enviado exitosamente:', result);
    return NextResponse.json({
      success: true,
      message: 'Conversación iniciada exitosamente',
      data: result
    });

  } catch (error) {
    console.error('❌ Error en trigger-conversation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
