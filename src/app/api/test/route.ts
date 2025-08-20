import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
}
