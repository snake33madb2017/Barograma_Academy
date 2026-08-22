'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@laesquina.com', password: 'admin123' }),
        });

        if (!response.ok) {
          throw new Error('No se pudo auto-iniciar sesión');
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
      }
    };

    autoLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 flex flex-col items-center">
        <img src="/logo.png" alt="Barograma" className="h-16 mb-4 object-contain animate-pulse" />
        <h2 className="text-xl font-bold text-white text-center mb-4">
          Iniciando sesión automáticamente...
        </h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
