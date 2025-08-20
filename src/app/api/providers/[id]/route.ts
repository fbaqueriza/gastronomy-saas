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
    const providerId = params.id;
    
    const { data: updatedProvider, error } = await supabase
      .from('providers')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        category: body.category,
        cbu: body.cbu,
        delivery_days: body.deliveryDays,
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando proveedor:', error);
      return NextResponse.json({
        success: false,
        error: 'Error actualizando proveedor',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Proveedor actualizado correctamente',
      data: updatedProvider
    });
  } catch (error) {
    console.error('Error en PUT API providers/[id]:', error);
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
    const providerId = params.id;
    
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', providerId);

    if (error) {
      console.error('Error eliminando proveedor:', error);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando proveedor',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Proveedor eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en DELETE API providers/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
