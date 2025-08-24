import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Phone parameter is required'
      }, { status: 400 });
    }

    // Normalizar el número de teléfono
    let normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }

    // Buscar proveedor por teléfono
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .or(`phone.eq.${normalizedPhone},phone.eq.${normalizedPhone.substring(1)}`)
      .limit(1);

    if (error) {
      console.error('Error buscando proveedor:', error);
      return NextResponse.json({
        success: false,
        error: 'Error buscando proveedor'
      }, { status: 500 });
    }

    const provider = providers && providers.length > 0 ? providers[0] : null;

    return NextResponse.json({
      success: true,
      provider
    });

  } catch (error) {
    console.error('Error en find-by-phone:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
