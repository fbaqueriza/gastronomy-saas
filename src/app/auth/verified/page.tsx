import React from 'react';
import Link from 'next/link';

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600">¡Usuario verificado correctamente!</h1>
        <p className="mb-6 text-gray-700">Tu cuenta ha sido verificada. Ya puedes iniciar sesión.</p>
      </div>
    </div>
  );
} 