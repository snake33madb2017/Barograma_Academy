"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } catch (e) {
      // Si hay error parseando el usuario, mandarlo al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <img src="/logo.png" alt="Barograma Academy" className="h-16 mb-4 object-contain animate-pulse" />
      <p className="text-[#D4BC6F] text-sm">Cargando academia...</p>
    </div>
  );
}
