import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 API providers-test - Devolviendo datos de prueba...');
    
    // Datos de prueba para providers
    const testProviders = [
      {
        id: '1',
        name: 'L\'igiene',
        email: 'contacto@ligiene.com',
        phone: '+5491135562673',
        categories: ['limpieza', 'higiene'],
        notes: 'Proveedor de productos de limpieza',
        user_id: 'fbaqueriza@itba.edu.ar'
      },
      {
        id: '2',
        name: 'Baron de la Menta',
        email: 'info@barondelamenta.com',
        phone: '+5491140494130',
        categories: ['bebidas', 'licores'],
        notes: 'Proveedor de bebidas y licores',
        user_id: 'fbaqueriza@itba.edu.ar'
      },
      {
        id: '3',
        name: 'Distribuidora Central',
        email: 'ventas@distribuidoracentral.com',
        phone: '+5491145678901',
        categories: ['general'],
        notes: 'Distribuidora general de productos',
        user_id: 'fbaqueriza@itba.edu.ar'
      },
      {
        id: '4',
        name: 'Carnes Premium',
        email: 'pedidos@carnespremium.com',
        phone: '+5491145678902',
        categories: ['carnes', 'proteínas'],
        notes: 'Proveedor de carnes de calidad',
        user_id: 'fbaqueriza@itba.edu.ar'
      }
    ];
    
    console.log('✅ API providers-test - Devolviendo', testProviders.length, 'providers de prueba');
    
    return NextResponse.json({
      success: true,
      providers: testProviders
    });
    
  } catch (error) {
    console.error('❌ Error en providers-test:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
