import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.KAPSO_API_KEY;
    const baseUrl = process.env.KAPSO_BASE_URL;
    const phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;
    const agentId = process.env.KAPSO_AGENT_ID;
    const webhookSecret = process.env.KAPSO_WEBHOOK_SECRET;

    return NextResponse.json({ 
      success: true,
      config: {
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'No configurada',
        baseUrl: baseUrl || 'No configurada',
        phoneNumberId: phoneNumberId || 'No configurada',
        agentId: agentId || 'No configurada',
        webhookSecret: webhookSecret ? `${webhookSecret.substring(0, 10)}...` : 'No configurada'
      },
      status: {
        apiKeyConfigured: !!apiKey,
        baseUrlConfigured: !!baseUrl,
        phoneNumberIdConfigured: !!phoneNumberId,
        agentIdConfigured: !!agentId,
        webhookSecretConfigured: !!webhookSecret
      }
    });

  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      success: false 
    }, { status: 500 });
  }
}
