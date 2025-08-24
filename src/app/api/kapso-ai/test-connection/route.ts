import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.KAPSO_API_KEY;
    const baseUrl = process.env.KAPSO_BASE_URL || 'https://api.kapso.ai/v1';

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API Key no configurada',
        success: false 
      }, { status: 400 });
    }

    console.log('🔍 Probando conexión con Kapso AI...');

    // Probar la conexión básica
    const response = await fetch(`${baseUrl}/agents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en conexión con Kapso AI:', response.status, errorText);
      
      return NextResponse.json({ 
        error: `Error ${response.status}: ${errorText}`,
        success: false,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Conexión exitosa con Kapso AI:', data);

    return NextResponse.json({ 
      success: true,
      message: 'Conexión exitosa con Kapso AI',
      data: data
    });

  } catch (error) {
    console.error('❌ Error probando conexión con Kapso AI:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      success: false 
    }, { status: 500 });
  }
}
