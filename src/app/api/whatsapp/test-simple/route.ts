import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Endpoint funcionando correctamente',
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 