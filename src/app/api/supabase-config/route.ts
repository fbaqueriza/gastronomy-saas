import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    supabase_config: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'No configurada',
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada',
      service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'No configurada'
    },
    message: 'Verificación de configuración de Supabase'
  });
}
