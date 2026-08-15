'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [isReadyForInstall, setIsReadyForInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if event fired before React mounted
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      if (!sessionStorage.getItem('installDismissed')) {
        setIsReadyForInstall(true);
      }
    }

    // Escuchar el evento antes de que se instale (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Evitar molestar si el usuario ya lo cerró en esta sesión
      if (!sessionStorage.getItem('installDismissed')) {
        setIsReadyForInstall(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detección para iOS Safari (no soporta beforeinstallprompt)
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isInStandaloneMode = () => {
      return ('standalone' in window.navigator) && ((window.navigator as any).standalone);
    };

    if (isIos() && !isInStandaloneMode() && !sessionStorage.getItem('installDismissed')) {
      // En iOS podríamos mostrar un mensaje distinto explicando cómo instalar
      // setIsReadyForInstall(true); 
      // Por simplicidad en este banner, nos enfocamos en Android/Desktop
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsReadyForInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsReadyForInstall(false);
    setIsDismissed(true);
    sessionStorage.setItem('installDismissed', 'true');
  };

  if (!isReadyForInstall || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 border border-[#D4BC6F] rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-black p-2 rounded-lg border border-gray-800">
            <Download className="w-6 h-6 text-[#D4BC6F]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Instalar Barograma</h3>
            <p className="text-gray-400 text-xs mt-1">
              Accede offline y más rápido desde tu inicio.
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-[#D4BC6F] text-black font-bold py-2 px-4 rounded-lg text-sm hover:bg-[#bba45f] transition-colors"
        >
          Instalar App
        </button>
      </div>
    </div>
  );
}
