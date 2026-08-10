'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPERADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Barograma" className="h-16 mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-white text-center">
            Iniciar Sesión
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-[#D4BC6F] transition-colors"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-[#D4BC6F] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-black transition-all"
            style={{ backgroundColor: loading ? '#887847' : '#D4BC6F' }}
          >
            {loading ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            Credenciales de prueba: <br/>
            Admin: admin@laesquina.com / admin123 <br/>
            Alumno: juan@laesquina.com / student123
          </p>
        </div>
      </div>
    </div>
  );
}
