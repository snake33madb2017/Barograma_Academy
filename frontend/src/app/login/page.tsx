'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setError('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas o error en el servidor');
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 flex flex-col items-center">
        <img src="/logo.png" alt="Barograma" className="h-16 mb-8 object-contain" />
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Iniciar Sesión
        </h2>
        
        <div className="w-full space-y-4">
          <button 
            onClick={() => handleLogin('juan@laesquina.com', 'student123')}
            disabled={isLoading}
            className="w-full bg-[#D4BC6F] text-black font-bold py-3 rounded-lg hover:bg-[#bba45f] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : 'Entrar como Estudiante'}
          </button>
          
          <button 
            onClick={() => handleLogin('admin@laesquina.com', 'admin123')}
            disabled={isLoading}
            className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : 'Entrar como Administrador'}
          </button>
        </div>

        {error && (
          <div className="w-full mt-6 bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
