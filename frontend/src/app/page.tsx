"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Barograma Academy" className="h-16 mb-4 object-contain" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#D4BC6F' }}>
            Barograma Academy
          </h1>
          <p className="text-gray-400">Portal de Demostración (Prototipo)</p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard" className="block w-full p-4 rounded-xl font-bold bg-gray-900 border-2 border-gray-800 hover:border-[#D4BC6F] transition-colors text-left">
            <h2 className="text-xl mb-1" style={{ color: '#D4BC6F' }}>🧑‍🎓 Vista de Estudiante</h2>
            <p className="text-sm text-gray-400 font-normal">Simula la experiencia de un camarero o empleado (PWA Móvil con vídeos HLS).</p>
          </Link>

          <Link href="/admin" className="block w-full p-4 rounded-xl font-bold bg-gray-900 border-2 border-gray-800 hover:border-[#D4BC6F] transition-colors text-left">
            <h2 className="text-xl mb-1" style={{ color: '#D4BC6F' }}>📊 Panel B2B (Restaurante)</h2>
            <p className="text-sm text-gray-400 font-normal">Simula el dashboard del dueño del local. KPI de progreso, gráficas y alertas del equipo.</p>
          </Link>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Nota para el cliente: Esta versión preliminar está diseñada para validar la estructura visual y de navegación. Todos los datos son demostrativos.
          </p>
        </div>
      </div>
    </div>
  );
}
