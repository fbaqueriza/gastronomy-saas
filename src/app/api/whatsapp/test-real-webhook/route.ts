import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Simular el payload real de WhatsApp Business API
    const webhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "1123051623072203",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "5491141780300",
                  phone_number_id: "670680919470999"
                },
                contacts: [
                  {
                    profile: {
                      name: "L'igiene"
                    },
                    wa_id: "5491135562673"
                  }
                ],
                messages: [
                  {
                    from: "5491135562673",
                    id: "wamid.HBgNNTQ5MTEzNTU2MjY3MxUCABEYEjM3MDAyNUQ2NUIwNjM5OTg3RgA=",
                    timestamp: new Date().toISOString(),
                    type: "text",
                    text: {
                      body: "Hola, este es un mensaje de prueba real desde mi número personal"
                    }
                  }
                ]
              },
              field: "messages"
            }
          ]
        }
      ]
    };

    console.log('📥 TEST-REAL-WEBHOOK - Procesando webhook real simulado:', webhookPayload);

    // Procesar el mensaje como si fuera real
    if (webhookPayload.entry && webhookPayload.entry[0]?.changes) {
      const change = webhookPayload.entry[0].changes[0];
      
      if (change.value?.messages && change.value.messages.length > 0) {
        const message = change.value.messages[0];
        const contact = change.value.contacts?.[0];
        
        // Guardar en base de datos
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('whatsapp_messages')
              .insert([{
                message_sid: message.id,
                contact_id: message.from,
                content: message.text?.body || '',
                message_type: message.type,
                status: 'delivered',
                user_id: 'default_user',
                timestamp: new Date().toISOString()
              }])
              .select()
              .single();

            if (error) {
              console.error('Error guardando mensaje real:', error);
            } else {
              console.log('✅ TEST-REAL-WEBHOOK - Mensaje real guardado:', data);
            }
          } catch (error) {
            console.error('Error guardando mensaje real:', error);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook real simulado procesado correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 TEST-REAL-WEBHOOK - Error:', error);
    return NextResponse.json(
      { error: 'Error processing real webhook simulation' },
      { status: 500 }
    );
  }
}
