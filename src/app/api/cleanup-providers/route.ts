import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Iniciando limpieza de providers...');
    
    // Obtener todos los providers
    const { data: allProviders, error: fetchError } = await supabase
      .from('providers')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error obteniendo providers:', fetchError);
      return NextResponse.json({ error: 'Error obteniendo providers' }, { status: 500 });
    }
    
    console.log(`📋 Total providers encontrados: ${allProviders?.length || 0}`);
    
    // Identificar providers inválidos
    const invalidProviders = allProviders?.filter(provider => {
      const hasValidName = provider.name && provider.name.trim() !== '';
      const hasValidContactName = provider.contact_name && provider.contact_name.trim() !== '';
      const hasValidPhone = provider.phone && provider.phone.trim() !== '';
      
      return !((hasValidName || hasValidContactName) && hasValidPhone);
    }) || [];
    
    console.log(`🚨 Providers inválidos encontrados: ${invalidProviders.length}`);
    
    if (invalidProviders.length === 0) {
      return NextResponse.json({ 
        message: 'No hay providers inválidos para limpiar',
        totalProviders: allProviders?.length || 0
      });
    }
    
    // Mostrar detalles de providers inválidos
    invalidProviders.forEach(provider => {
      console.log(`  - ID: ${provider.id}`);
      console.log(`    Name: '${provider.name}'`);
      console.log(`    Contact Name: '${provider.contact_name}'`);
      console.log(`    Phone: '${provider.phone}'`);
    });
    
    // Eliminar providers inválidos
    const invalidIds = invalidProviders.map(p => p.id);
    const { error: deleteError } = await supabase
      .from('providers')
      .delete()
      .in('id', invalidIds);
    
    if (deleteError) {
      console.error('❌ Error eliminando providers:', deleteError);
      return NextResponse.json({ error: 'Error eliminando providers' }, { status: 500 });
    }
    
    console.log(`✅ Providers eliminados: ${invalidIds.length}`);
    
    // Obtener providers restantes
    const { data: remainingProviders, error: remainingError } = await supabase
      .from('providers')
      .select('*');
    
    if (remainingError) {
      console.error('❌ Error obteniendo providers restantes:', remainingError);
    }
    
    return NextResponse.json({
      message: 'Limpieza completada exitosamente',
      deletedCount: invalidIds.length,
      remainingCount: remainingProviders?.length || 0,
      deletedProviders: invalidProviders.map(p => ({
        id: p.id,
        name: p.name,
        contact_name: p.contact_name,
        phone: p.phone
      }))
    });
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
