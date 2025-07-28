import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando variables de entorno...');
    
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
    
    console.log('📊 Estado de variables de entorno:', envCheck);
    
    return NextResponse.json({
      success: true,
      message: 'Verificación de variables de entorno',
      envCheck,
      hasAllRequired: envCheck.NEXT_PUBLIC_SUPABASE_URL && envCheck.SUPABASE_SERVICE_ROLE_KEY
    });
    
  } catch (error) {
    console.error('Error verificando variables de entorno:', error);
    return NextResponse.json({ 
      error: 'Error verificando variables de entorno',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 