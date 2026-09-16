"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Public access
    localStorage.setItem('token', 'public-mock-token');
    localStorage.setItem('user', JSON.stringify({ id: 'public-user-id', role: 'STUDENT', name: 'Public User', companyId: 'demo' }));
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <img src="/logo.png" alt="Barograma Academy" className="h-16 mb-4 object-contain animate-pulse" />
      <p className="text-[#D4BC6F] text-sm">Cargando academia...</p>
    </div>
  );
}
