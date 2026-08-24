'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) setIsSubscribed(true);
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  }

  const subscribeUser = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Permiso denegado');
        return;
      }

      const VAPID_PUBLIC_KEY = 'BFJvsXZNk0CxwsQA0wamdEIxGtjTAo_3--a1rtqWIEPSdAW5fL1pUCqbWXYmbQ52ucSSbSxKd-nBBDFkM5hEAr8';
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) setIsSubscribed(true);
    } catch (error) {
      console.error('Error al suscribirse:', error);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={subscribeUser}
      disabled={isSubscribed}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isSubscribed
          ? 'bg-green-600 text-white cursor-not-allowed'
          : 'bg-[#D4BC6F] text-black hover:bg-[#bba45f]'
      }`}
    >
      🔔 {isSubscribed ? 'Notificaciones Activadas' : 'Activar Notificaciones'}
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
