import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Verificar si las credenciales están presentes
    const hasCredentials = !!(accountSid && authToken && phoneNumber);
    
    // Verificar si las credenciales son válidas (no son placeholders)
    const hasValidCredentials = hasCredentials && 
      accountSid !== 'your_account_sid' && 
      authToken !== 'your_auth_token' &&
      accountSid.length > 10 &&
      authToken.length > 10;

    // Determinar el modo de operación
    let mode = 'unknown';
    let status = 'disabled';
    
    if (!hasCredentials) {
      mode = 'no_credentials';
      status = 'disabled';
    } else if (!hasValidCredentials) {
      mode = 'invalid_credentials';
      status = 'simulation';
    } else {
      mode = 'production';
      status = 'enabled';
    }

    return NextResponse.json({
      success: true,
      config: {
        mode,
        status,
        hasCredentials,
        hasValidCredentials,
        accountSid: accountSid ? 'Present' : 'Missing',
        authToken: authToken ? 'Present' : 'Missing',
        phoneNumber: phoneNumber ? 'Present' : 'Missing',
        accountSidLength: accountSid?.length || 0,
        authTokenLength: authToken?.length || 0
      },
      recommendations: {
        ifNoCredentials: 'Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local',
        ifInvalidCredentials: 'Update credentials with valid Twilio Account SID and Auth Token',
        ifValidCredentials: 'System ready for production WhatsApp messaging'
      }
    });

  } catch (error: any) {
    console.error('Error getting WhatsApp config:', error);
    return NextResponse.json({
      success: false,
      message: 'Error getting configuration',
      error: error.message
    }, { status: 500 });
  }
}