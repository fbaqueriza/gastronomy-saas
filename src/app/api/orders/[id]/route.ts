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
    const orderId = params.id;
    
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        order_number: body.orderNumber,
        provider_id: body.providerId,
        items: body.items,
        status: body.status,
        total_amount: body.totalAmount,
        currency: body.currency,
        order_date: body.orderDate,
        due_date: body.dueDate,
        invoice_number: body.invoiceNumber,
        bank_info: body.bankInfo,
        receipt_url: body.receiptUrl,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando orden:', error);
      return NextResponse.json({
        success: false,
        error: 'Error actualizando orden',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Orden actualizada correctamente',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error en PUT API orders/[id]:', error);
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
    const orderId = params.id;
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error eliminando orden:', error);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando orden',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Orden eliminada correctamente'
    });
  } catch (error) {
    console.error('Error en DELETE API orders/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
