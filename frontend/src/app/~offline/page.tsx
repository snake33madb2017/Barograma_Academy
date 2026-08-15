import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Sin Conexión | Barograma Academy',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 text-center">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 flex flex-col items-center">
        <div className="bg-gray-800 p-4 rounded-full mb-6 border border-gray-700">
          <WifiOff className="w-12 h-12 text-[#D4BC6F]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Estás desconectado
        </h2>
        
        <p className="text-gray-400 mb-8">
          Parece que has perdido la conexión a internet. Conéctate a una red Wi-Fi o de datos para continuar tu formación en Barograma Academy.
        </p>

        <Link
          href="/"
          className="w-full bg-[#D4BC6F] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#bba45f] transition-colors inline-block"
        >
          Reintentar
        </Link>
      </div>
    </div>
  );
}
