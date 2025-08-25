import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('pending_orders')
      .select('*')
      .eq('status', 'pending_confirmation')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo pedidos pendientes:', error);
      return NextResponse.json(
        { success: false, error: 'Error obteniendo de base de datos' },
        { status: 500 }
      );
    }

    // Transformar los datos para que coincidan con el formato esperado
    const pendingOrders = data.map(row => ({
      orderId: row.order_id,
      providerId: row.provider_id,
      providerPhone: row.provider_phone,
      orderData: row.order_data,
      status: row.status,
      createdAt: row.created_at
    }));

    return NextResponse.json({
      success: true,
      pendingOrders
    });

  } catch (error) {
    console.error('Error en get-all-pending-orders:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
