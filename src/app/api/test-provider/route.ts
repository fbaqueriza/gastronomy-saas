import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ API test-provider - Variables de entorno faltantes');
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 API /api/test-provider - Probando inserción de proveedor...');
    
    const body = await request.json();
    const { userEmail } = body;
    
    // Obtener el user_id del email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError) {
      console.error('❌ API test-provider - Error obteniendo user_id:', userError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo user_id' 
      }, { status: 500 });
    }
    
    if (!userData) {
      console.error('❌ API test-provider - Usuario no encontrado:', userEmail);
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }
    
    // Crear un proveedor de prueba
    const testProvider = {
      name: 'Proveedor de Prueba',
      email: 'test@proveedor.com',
      contact_name: 'Contacto Test',
      phone: '123456789',
      address: 'Dirección Test',
      categories: ['test'],
      tags: ['test'],
      notes: 'Proveedor de prueba creado automáticamente',
      cbu: '',
      alias: '',
      razon_social: '',
      cuit_cuil: '',
      default_delivery_days: [],
      default_delivery_time: [],
      default_payment_method: 'efectivo',
      catalogs: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: userData.id,
    };
    
    console.log('🧪 API test-provider - Insertando proveedor de prueba:', testProvider);
    
    const { data: insertedProvider, error: insertError } = await supabase
      .from('providers')
      .insert([testProvider])
      .select();
    
    if (insertError) {
      console.error('❌ API test-provider - Error insertando proveedor:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error insertando proveedor: ' + insertError.message 
      }, { status: 500 });
    }
    
    console.log('✅ API test-provider - Proveedor insertado exitosamente:', insertedProvider);
    
    return NextResponse.json({
      success: true,
      provider: insertedProvider?.[0] || null,
      message: 'Proveedor de prueba creado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ API test-provider - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
