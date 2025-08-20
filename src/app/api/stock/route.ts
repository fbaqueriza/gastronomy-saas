import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let query = supabase
      .from('stock_items')
      .select('*')
      .order('name', { ascending: true });
    
    // Filtrar por usuario si se proporciona
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: stockItems, error } = await query;
    
    if (error) {
      console.error('❌ Error obteniendo stock:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Error obteniendo stock' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      stockItems: stockItems || [],
      count: stockItems?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint stock:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: savedItem, error } = await supabase
      .from('stock_items')
      .insert({
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        unit: body.unit,
        min_quantity: body.minQuantity,
        max_quantity: body.maxQuantity,
        category: body.category,
        associated_providers: body.associatedProviders || [],
        next_order: body.nextOrder,
        user_id: body.userId || 'default_user'
      })
      .select()
      .single();

    if (error) {
      console.error('Error guardando item de stock:', error);
      return NextResponse.json({
        success: false,
        error: 'Error guardando item de stock',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item de stock guardado correctamente',
      data: savedItem
    });
  } catch (error) {
    console.error('Error en POST API stock:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
