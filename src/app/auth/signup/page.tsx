'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();

  const { signUp, needsEmailVerification, clearEmailVerification } = useSupabaseAuth();
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    try {
      await signUp(email, password);
      setShowVerificationMessage(true);
      // No redirigir inmediatamente, mostrar mensaje de verificación
    } catch (err: any) {
      setError(err.message || JSON.stringify(err) || 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {showVerificationMessage ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">¡Registro exitoso!</h2>
            <div className="mb-6 text-gray-600">
              <p className="mb-2">Hemos enviado un enlace de verificación a tu correo electrónico.</p>
              <p className="mb-2">Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
              <p className="text-sm text-gray-500">Si no recibiste el email, revisa tu carpeta de spam.</p>
            </div>
            <button
              onClick={() => {
                setShowVerificationMessage(false);
                clearEmailVerification();
                router.push('/auth/login');
              }}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Ir al login
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Registrarse</h2>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {needsEmailVerification && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Verificación de email requerida
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta.
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={clearEmailVerification}
                      className="text-sm text-blue-600 hover:text-blue-500 underline"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full mb-6 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
        <div className="mt-4 text-center">
          <a href="/auth/login" className="text-blue-600 hover:underline">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </form>
      )}
    </div>
  );
}
