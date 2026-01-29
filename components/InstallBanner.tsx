
import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, ArrowDown } from 'lucide-react';

const InstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');

    // Show banner after a short delay
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || platform === 'other') return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[100] animate-in slide-in-from-top-10 duration-500">
      <div className="bg-blue-600 rounded-3xl p-5 shadow-2xl border border-white/20 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={18} className="text-white/80" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Smartphone className="text-blue-600" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Install Gemini Pro</h3>
            <p className="text-[11px] text-blue-100 font-medium leading-tight">Add to your home screen for a full-screen experience.</p>
          </div>
        </div>

        <div className="bg-black/20 rounded-2xl p-4 space-y-3">
          {platform === 'ios' ? (
            <div className="flex items-center gap-3 text-xs text-white font-medium">
              <span className="bg-white/10 p-2 rounded-xl"><Share size={16} /></span>
              <span>Tap 'Share' and then <strong>'Add to Home Screen'</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-white font-medium">
              <span className="bg-white/10 p-2 rounded-xl"><PlusSquare size={16} /></span>
              <span>Tap the menu icon (⋮) and then <strong>'Install App'</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
