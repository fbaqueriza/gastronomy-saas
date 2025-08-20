import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const stockId = params.id;
    
    const { data: updatedStock, error } = await supabase
      .from('stock_items')
      .update({
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        unit: body.unit,
        min_quantity: body.minQuantity,
        max_quantity: body.maxQuantity,
        category: body.category,
        associated_providers: body.associatedProviders,
        next_order: body.nextOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', stockId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando item de stock:', error);
      return NextResponse.json({
        success: false,
        error: 'Error actualizando item de stock',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item de stock actualizado correctamente',
      data: updatedStock
    });
  } catch (error) {
    console.error('Error en PUT API stock/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stockId = params.id;
    
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', stockId);

    if (error) {
      console.error('Error eliminando item de stock:', error);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando item de stock',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item de stock eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en DELETE API stock/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
