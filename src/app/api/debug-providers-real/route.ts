import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API debug-providers-real - Verificando proveedores...');
    
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Verificar el token y obtener el usuario
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        user = authUser;
        console.log(`🔍 API debug-providers-real - Usuario autenticado: ${user.email} (ID: ${user.id})`);
      } else {
        console.log('🔍 API debug-providers-real - Error de autenticación:', authError?.message);
        return NextResponse.json({
          success: false,
          error: 'Usuario no autenticado',
          authError: authError?.message
        }, { status: 401 });
      }
    } else {
      console.log('🔍 API debug-providers-real - No hay token de autorización');
      return NextResponse.json({
        success: false,
        error: 'Token de autorización requerido'
      }, { status: 401 });
    }

    // Obtener TODOS los proveedores de la tabla
    const { data: allProviders, error: allProvidersError } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (allProvidersError) {
      console.error('❌ API debug-providers-real - Error obteniendo todos los proveedores:', allProvidersError);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo proveedores',
        details: allProvidersError.message
      }, { status: 500 });
    }

    console.log(`🔍 API debug-providers-real - Total de proveedores en la tabla: ${allProviders?.length || 0}`);
    
    // Filtrar proveedores del usuario actual
    const userProviders = allProviders?.filter(p => p.user_id === user.id) || [];
    console.log(`🔍 API debug-providers-real - Proveedores para ${user.email}: ${userProviders.length}`);

    // Mostrar detalles de cada proveedor
    const providersDetails = userProviders.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      user_id: p.user_id,
      created_at: p.created_at
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      totalProvidersInTable: allProviders?.length || 0,
      userProvidersCount: userProviders.length,
      userProviders: providersDetails,
      allProviders: allProviders?.map(p => ({
        id: p.id,
        name: p.name,
        user_id: p.user_id
      }))
    });

  } catch (error) {
    console.error('❌ API debug-providers-real - Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
