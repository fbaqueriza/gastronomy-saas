'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const router = useRouter();
  const { needsEmailVerification, clearEmailVerification } = useSupabaseAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  const { signIn } = useSupabaseAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (rememberEmail) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Descripción de la plataforma */}
      <div className="mb-8 text-center max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🍽️ Gastronomy SaaS
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Plataforma integral para la gestión de restaurantes y servicios gastronómicos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">WhatsApp Business</h3>
            <p>Gestión centralizada de mensajes y pedidos</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p>Reportes y métricas en tiempo real</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Automatización</h3>
            <p>Flujos de trabajo inteligentes</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
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
                  <p className="mt-2">
                    Si no recibiste el email, revisa tu carpeta de spam o solicita un nuevo enlace.
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
        <div className="flex items-center mb-4">
          <input
            id="rememberEmail"
            type="checkbox"
            checked={rememberEmail}
            onChange={e => setRememberEmail(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="rememberEmail" className="text-sm text-gray-700">Recordar correo</label>
        </div>
        <div className="relative w-full mb-6">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
        <div className="mt-4 text-center">
          <a href="/auth/signup" className="text-blue-600 hover:underline">¿No tienes cuenta? Regístrate</a>
        </div>
      </form>
    </div>
  );
}
