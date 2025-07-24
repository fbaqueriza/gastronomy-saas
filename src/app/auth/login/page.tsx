'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error de inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
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
