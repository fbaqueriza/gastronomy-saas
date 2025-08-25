import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar las variables de entorno correctas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ API data/providers - Variables de entorno faltantes:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
  try {
    console.log('📥 API data/providers - Obteniendo providers...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ API data/providers - Variables de entorno faltantes');
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración faltante' 
      }, { status: 500 });
    }
    
    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Verificar el token y obtener el usuario
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (user && !authError) {
          userId = user.id;
          console.log('🔐 API data/providers - Usuario autenticado:', userId);
        }
      } catch (error) {
        console.log('⚠️ API data/providers - Error verificando token:', error);
      }
    }
    
    // Construir la consulta
    let query = supabase.from('providers').select('*').order('name');
    
    // Si hay usuario autenticado, filtrar por user_id
    if (userId) {
      query = query.eq('user_id', userId);
      console.log('🔍 API data/providers - Filtrando por usuario:', userId);
    } else {
      console.log('⚠️ API data/providers - Sin autenticación, devolviendo todos los providers');
    }
    
    const { data: providers, error } = await query;
    
    if (error) {
      console.error('❌ API data/providers - Error obteniendo providers:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo providers',
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ API data/providers - Providers obtenidos:', providers?.length || 0);
    
    return NextResponse.json({
      success: true,
      providers: providers || []
    });
    
  } catch (error) {
    console.error('❌ API data/providers - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error
    }, { status: 500 });
  }
}
