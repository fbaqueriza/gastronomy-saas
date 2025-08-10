import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/debug-env - Verificando variables de entorno...');
    
    // Leer el archivo env.local directamente
    const envPath = join(process.cwd(), 'env.local');
    let envContent = '';
    let envFileExists = false;
    
    try {
      envContent = readFileSync(envPath, 'utf8');
      envFileExists = true;
    } catch (error) {
      console.log('❌ No se pudo leer env.local:', error);
    }
    
    // Verificar variables de entorno del proceso
    const processEnv = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    
    console.log('🔍 Variables del proceso:', {
      url: !!processEnv.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!processEnv.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    return NextResponse.json({
      success: true,
      envFile: {
        exists: envFileExists,
        path: envPath,
        content: envContent ? envContent.split('\n').slice(0, 5).join('\n') + '...' : 'No encontrado'
      },
      processEnv: {
        url: processEnv.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ Faltante',
        anonKey: processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Faltante',
        serviceKey: processEnv.SUPABASE_SERVICE_ROLE_KEY ? '✅ Presente' : '❌ Faltante',
        urlLength: processEnv.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        anonKeyLength: processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceKeyLength: processEnv.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      },
      cwd: process.cwd()
    });
    
  } catch (error) {
    console.error('❌ API debug-env - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message
    }, { status: 500 });
  }
}
