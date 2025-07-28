import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    // Verificar configuración de Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const configStatus = {
      accountSid: accountSid ? 'Present' : 'Missing',
      authToken: authToken ? 'Present' : 'Missing',
      phoneNumber: phoneNumber ? 'Present' : 'Missing',
      allConfigured: !!(accountSid && authToken && phoneNumber)
    };

    if (!configStatus.allConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Twilio configuration incomplete',
        config: configStatus
      }, { status: 400 });
    }

    // Intentar crear cliente de Twilio (sin enviar mensaje)
    try {
      const client = twilio(accountSid, authToken);
      
      // Verificar que las credenciales son válidas intentando obtener información de la cuenta
      const account = await client.api.accounts(accountSid!).fetch();
      
      return NextResponse.json({
        success: true,
        message: 'Twilio configuration is valid',
        config: configStatus,
        accountInfo: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status
        }
      });
    } catch (twilioError: any) {
      return NextResponse.json({
        success: false,
        message: 'Twilio credentials are invalid',
        config: configStatus,
        error: twilioError.message
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error('Error checking Twilio config:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking configuration',
      error: error.message
    }, { status: 500 });
  }
} 