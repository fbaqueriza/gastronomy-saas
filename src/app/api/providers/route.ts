import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente con Anon Key (sin RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente con Service Role Key (para bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      // Verificar token con Anon Key
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        user = authUser;
      }
    }

    // Si hay usuario autenticado, obtener sus proveedores
    if (user) {
      const { data: providers, error: providersError } = await supabaseAdmin
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (providersError) {
        return NextResponse.json({ 
          error: 'Error obteniendo proveedores: ' + providersError.message 
        }, { status: 500 });
      }

      return NextResponse.json({ providers: providers || [] });
    } else {
      // Modo landing page - devolver algunos proveedores de ejemplo
      
      // Obtener L'igiene específicamente y otros proveedores
      const { data: ligieneProvider, error: ligieneError } = await supabaseAdmin
        .from('providers')
        .select('*')
        .ilike('name', '%L\'igiene%')
        .limit(1);

      const { data: otherProviders, error: otherError } = await supabaseAdmin
        .from('providers')
        .select('*')
        .not('name', 'ilike', '%L\'igiene%')
        .limit(4)
        .order('created_at', { ascending: false });

      if (ligieneError || otherError) {
        return NextResponse.json({ 
          error: 'Error obteniendo proveedores: ' + (ligieneError?.message || otherError?.message) 
        }, { status: 500 });
      }

      const sampleProviders = [...(ligieneProvider || []), ...(otherProviders || [])];

      return NextResponse.json({ providers: sampleProviders || [] });
    }

  } catch (error) {
    console.error('❌ API Providers: Error general:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API providers POST: Iniciando creación de providers de prueba');
    
    // Intentar crear con Service Role Key
    const testProviders = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'b5a237e6-c9f9-4561-af07-a1408825ab50',
        name: "L'igiene",
        email: 'ventas@ligiene.com',
        phone: '+5491135562673',
        categories: ['limpieza'],
        tags: ['confiable'],
        catalogs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: 'b5a237e6-c9f9-4561-af07-a1408825ab50',
        name: 'Distribuidora Central',
        email: 'pedidos@distcentral.com',
        phone: '+5491145678901',
        categories: ['alimentos'],
        tags: ['rapido'],
        catalogs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('🔍 API providers POST: Providers a crear:', testProviders);
    
    const { data, error } = await supabaseAdmin
      .from('providers')
      .upsert(testProviders, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ API providers POST - Error creando providers:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error creando providers: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('✅ API providers POST - Providers creados exitosamente:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Providers de prueba creados',
      providers: data
    });
    
  } catch (error) {
    console.error('❌ API providers POST - Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
