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
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filtrar por usuario si se proporciona
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: orders, error } = await query;
    
    if (error) {
      console.error('❌ Error obteniendo órdenes:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Error obteniendo órdenes' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint orders:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: savedOrder, error } = await supabase
      .from('orders')
      .insert({
        order_number: body.orderNumber,
        provider_id: body.providerId,
        items: body.items,
        status: body.status || 'pending',
        total_amount: body.totalAmount,
        currency: body.currency || 'ARS',
        order_date: body.orderDate,
        due_date: body.dueDate,
        invoice_number: body.invoiceNumber,
        bank_info: body.bankInfo,
        receipt_url: body.receiptUrl,
        notes: body.notes,
        user_id: body.userId || 'default_user'
      })
      .select()
      .single();

    if (error) {
      console.error('Error guardando orden:', error);
      return NextResponse.json({
        success: false,
        error: 'Error guardando orden',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Orden guardada correctamente',
      data: savedOrder
    });
  } catch (error) {
    console.error('Error en POST API orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
