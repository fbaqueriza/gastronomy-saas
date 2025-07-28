import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json({
        success: false,
        message: 'Missing Twilio configuration',
        config: {
          accountSid: accountSid ? 'Present' : 'Missing',
          authToken: authToken ? 'Present' : 'Missing',
          phoneNumber: phoneNumber ? 'Present' : 'Missing'
        }
      }, { status: 400 });
    }

    const client = twilio(accountSid, authToken);

    try {
      // Verificar información de la cuenta
      const account = await client.api.accounts(accountSid).fetch();
      
      // Verificar si el número está disponible para WhatsApp
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({
        phoneNumber: phoneNumber
      });

      const phoneNumberInfo = incomingPhoneNumbers.length > 0 ? incomingPhoneNumbers[0] : null;

      return NextResponse.json({
        success: true,
        message: 'Twilio configuration check completed',
        account: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type
        },
        phoneNumber: {
          number: phoneNumber,
          found: !!phoneNumberInfo,
          capabilities: phoneNumberInfo ? phoneNumberInfo.capabilities : null,
          status: phoneNumberInfo ? phoneNumberInfo.status : 'Not found'
        },
        whatsappEnabled: phoneNumberInfo ? 
          ((phoneNumberInfo.capabilities as any)?.whatsapp || false) : false
      });

    } catch (twilioError: any) {
      return NextResponse.json({
        success: false,
        message: 'Twilio API error',
        error: twilioError.message,
        code: twilioError.code,
        moreInfo: twilioError.moreInfo
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error checking Twilio:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking configuration',
      error: error.message
    }, { status: 500 });
  }
} 