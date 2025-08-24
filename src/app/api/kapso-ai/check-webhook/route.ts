import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Verificando configuración del webhook del agente...');
    
    const webhookUrl = 'https://ab3390cd06e0.ngrok-free.app/api/kapso-ai/agent-webhook';
    const agentId = '657bc308-c5c2-46e3-b81c-190ceab3fa6f';
    const apiKey = process.env.KAPSO_API_KEY;
    const baseUrl = process.env.KAPSO_BASE_URL;
    
    console.log('📡 URL del webhook configurada:', webhookUrl);
    console.log('🤖 Agent ID:', agentId);
    console.log('🔑 API Key configurada:', apiKey ? 'Sí' : 'No');
    console.log('🌐 Base URL:', baseUrl);
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Kapso AI no configurada' },
        { status: 400 }
      );
    }
    
    // Verificar si el agente existe y obtener su configuración
    const response = await fetch(`${baseUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Respuesta de Kapso AI:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error obteniendo información del agente:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Error obteniendo información del agente: ${response.status}`,
          details: errorText
        },
        { status: 500 }
      );
    }
    
    const agentInfo = await response.json();
    console.log('✅ Información del agente obtenida:', agentInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Configuración del agente verificada',
      webhookUrl,
      agentId,
      agentInfo,
      expectedWebhookUrl: webhookUrl,
      ngrokUrl: 'https://ab3390cd06e0.ngrok-free.app'
    });
    
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
