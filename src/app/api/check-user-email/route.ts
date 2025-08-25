import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando si el email está registrado:', email);

    // Por ahora, vamos a simular la verificación
    // En un entorno real, aquí consultarías la base de datos
    
    // Simular que el email no está registrado
    console.log('❌ Usuario no encontrado para el email:', email);
    return NextResponse.json({
      success: true,
      userExists: false,
      message: 'El email no está registrado en el sistema. Necesitas registrarte primero.'
    });

  } catch (error) {
    console.error('❌ Error en check-user-email:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
