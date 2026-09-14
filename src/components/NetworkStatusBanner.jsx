import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

export const NetworkStatusBanner = () => {
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let timer;

    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let handleConnectionChange;
    if (typeof navigator !== 'undefined' && navigator.connection) {
      handleConnectionChange = () => {
        const conn = navigator.connection;
        if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
          setIsOffline(true);
        }
      };
      try {
        navigator.connection.addEventListener('change', handleConnectionChange);
      } catch (e) {}
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (typeof navigator !== 'undefined' && navigator.connection && handleConnectionChange) {
        try {
          navigator.connection.removeEventListener('change', handleConnectionChange);
        } catch (e) {}
      }
    };
  }, []);

  if (isOffline) {
    return (
      <div className="sticky top-0 z-50 bg-stone-900 text-amber-300 py-2.5 px-4 text-xs sm:text-sm font-extrabold text-center border-b border-stone-800 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span>⚠️ Network disconnected. Please check your internet before placing orders.</span>
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="sticky top-0 z-50 bg-emerald-700 text-white py-2 px-4 text-xs sm:text-sm font-extrabold text-center flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top fade-out duration-300">
        <Wifi className="w-4 h-4 text-emerald-200 shrink-0" />
        <span>✅ Back Online</span>
      </div>
    );
  }

  return null;
};
