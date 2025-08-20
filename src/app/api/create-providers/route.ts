import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API create-providers: Iniciando creación de providers de prueba');
    
    const testProviders = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'b5a237e6-c9f9-4561-af07-a1408825ab50',
        name: 'L\'igiene',
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
    
    console.log('🔍 API create-providers: Providers a crear:', testProviders);
    
    const { data, error } = await supabaseAdmin
      .from('providers')
      .upsert(testProviders, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ API create-providers - Error creando providers:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error creando providers: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('✅ API create-providers - Providers creados exitosamente:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Providers de prueba creados',
      providers: data
    });
    
  } catch (error) {
    console.error('❌ API create-providers - Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
