'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

export default function EmailVerifiedPage() {
  const router = useRouter();
  const { emailVerified, clearEmailVerified } = useSupabaseAuth();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Si el email fue verificado, mostrar el mensaje
    if (emailVerified) {
      setShowMessage(true);
      clearEmailVerified();
    } else {
      // Si no hay verificación, redirigir al login
      router.push('/auth/login');
    }
  }, [emailVerified, clearEmailVerified, router]);

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (!showMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">¡Email verificado!</h2>
          <div className="mb-6 text-gray-600">
            <p className="mb-2">Tu cuenta ha sido verificada exitosamente.</p>
            <p className="mb-2">Ya puedes acceder a la plataforma con tu email y contraseña.</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleGoToLogin}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Ir al login
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Ir al dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}