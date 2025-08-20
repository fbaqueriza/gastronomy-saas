import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Listando todos los providers...');
    
    // Obtener todos los providers
    const { data: allProviders, error: fetchError } = await supabase
      .from('providers')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error obteniendo providers:', fetchError);
      return NextResponse.json({ error: 'Error obteniendo providers' }, { status: 500 });
    }
    
    console.log(`📋 Total providers encontrados: ${allProviders?.length || 0}`);
    
    // Clasificar providers
    const validProviders = allProviders?.filter(provider => {
      const hasValidName = provider.name && provider.name.trim() !== '';
      const hasValidContactName = provider.contact_name && provider.contact_name.trim() !== '';
      const hasValidPhone = provider.phone && provider.phone.trim() !== '';
      
      return (hasValidName || hasValidContactName) && hasValidPhone;
    }) || [];
    
    const invalidProviders = allProviders?.filter(provider => {
      const hasValidName = provider.name && provider.name.trim() !== '';
      const hasValidContactName = provider.contact_name && provider.contact_name.trim() !== '';
      const hasValidPhone = provider.phone && provider.phone.trim() !== '';
      
      return !((hasValidName || hasValidContactName) && hasValidPhone);
    }) || [];
    
    return NextResponse.json({
      totalProviders: allProviders?.length || 0,
      validProviders: validProviders.length,
      invalidProviders: invalidProviders.length,
      allProviders: allProviders?.map(p => ({
        id: p.id,
        name: p.name || '(vacío)',
        contact_name: p.contact_name || '(null)',
        phone: p.phone || '(vacío)',
        user_id: p.user_id
      }))
    });
    
  } catch (error) {
    console.error('❌ Error listando providers:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
