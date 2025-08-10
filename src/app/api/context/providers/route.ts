import { NextRequest, NextResponse } from 'next/server';

// Esta es una solución temporal para obtener providers del contexto
// En una implementación real, esto debería acceder al contexto de datos
export async function GET(request: NextRequest) {
  try {
    console.log('📥 API /api/context/providers - Obteniendo providers del contexto...');
    
    // Por ahora, devolver un array vacío ya que no podemos acceder al contexto desde una API route
    // En el futuro, esto podría implementarse con un store global como Zustand o similar
    
    console.log('⚠️ API /api/context/providers - No implementado aún, devolviendo array vacío');
    
    return NextResponse.json({
      success: true,
      providers: [],
      message: 'Context providers not implemented yet'
    });
    
  } catch (error) {
    console.error('❌ API /api/context/providers - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
