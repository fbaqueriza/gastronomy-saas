import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar las variables de entorno correctas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ API providers - Variables de entorno faltantes:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(request: NextRequest) {
  try {
    console.log('📥 API /api/providers - Obteniendo providers...');
    
    // Obtener el user_id de los query params
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const userId = searchParams.get('userId');
    const allProviders = searchParams.get('all') === 'true';
    
    console.log('📥 API /api/providers - Parámetros:', { userEmail, userId, allProviders });
    
    let query = supabase
      .from('providers')
      .select('*')
      .order('name');
    
    // Si se solicita todos los proveedores, no filtrar por usuario
    if (!allProviders) {
      // Si hay userEmail, buscar el user_id correspondiente
      if (userEmail) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .single();
        
        if (userError) {
          console.error('❌ API /api/providers - Error obteniendo user_id:', userError);
          return NextResponse.json({ 
            success: false, 
            error: 'Error obteniendo user_id' 
          }, { status: 500 });
        }
        
        if (userData) {
          query = query.eq('user_id', userData.id);
        }
      } else if (userId) {
        // Si hay userId directo, usarlo
        query = query.eq('user_id', userId);
      }
    }
    
    const { data: providers, error } = await query;
    
    if (error) {
      console.error('❌ API /api/providers - Error obteniendo providers:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo providers' 
      }, { status: 500 });
    }
    
    console.log('✅ API /api/providers - Providers obtenidos:', providers?.length || 0);
    
    return NextResponse.json({
      success: true,
      providers: providers || []
    });
    
  } catch (error) {
    console.error('❌ API /api/providers - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API providers - Creando provider de prueba...');
    
    // Crear un proveedor de prueba básico con UUID válido
    const testProvider = {
      id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
      name: 'L\'igiene',
      email: 'ventas@ligiene.com',
      phone: '+5491135562673'
    };
    
    console.log('📥 API providers - Provider a crear:', testProvider);
    
    // Insertar proveedor de prueba
    const { data, error } = await supabase
      .from('providers')
      .upsert(testProvider, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ API providers - Error creando provider:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error creando provider: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('✅ API providers - Provider de prueba creado:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Provider de prueba creado',
      provider: data
    });
    
  } catch (error) {
    console.error('❌ API providers - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
