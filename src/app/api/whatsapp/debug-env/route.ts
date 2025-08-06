import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      WHATSAPP_API_KEY: !!process.env.WHATSAPP_API_KEY,
      WHATSAPP_PHONE_NUMBER_ID: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_BUSINESS_ACCOUNT_ID: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      WHATSAPP_WEBHOOK_URL: !!process.env.WHATSAPP_WEBHOOK_URL,
      WHATSAPP_VERIFY_TOKEN: !!process.env.WHATSAPP_VERIFY_TOKEN,
    };

    const hasAllRequired = Object.values(envCheck).every(Boolean);

    return NextResponse.json({
      success: true,
      message: 'Verificación de variables de entorno de WhatsApp',
      envCheck,
      hasAllRequired,
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ? 'EXISTS' : 'MISSING',
      webhookUrl: process.env.WHATSAPP_WEBHOOK_URL || 'NOT_SET'
    });
  } catch (error) {
    console.error('Error in debug-env:', error);
    return NextResponse.json(
      { error: 'Error checking environment variables' },
      { status: 500 }
    );
  }
} 