
import React, { useState } from 'react';
import { User as UserType } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: UserType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    // Simulate a brief network delay
    setTimeout(() => {
      onLogin({
        id: Math.random().toString(36).substring(7),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d0e] flex items-center justify-center p-4 z-[200]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-[#1e1f20] rounded-[32px] border border-[#333] shadow-2xl p-8 md:p-12 relative overflow-hidden transition-all animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[2px] mb-6 animate-pulse">
            <div className="w-full h-full bg-[#1e1f20] rounded-[14px] flex items-center justify-center">
              <Sparkles className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue to Gemini Clone Pro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Display Name</label>
            <div className="relative group">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full bg-[#131314] border border-[#333] group-focus-within:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#131314] border border-[#333] group-focus-within:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all"
              />
              <Mail className="absolute right-4 top-3.5 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                Continue
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-[#131314] px-4 py-2 rounded-full border border-[#333]">
            <ShieldCheck size={14} className="text-green-500" />
            SECURE AUTHENTICATION ACTIVE
          </div>
          <p className="text-[11px] text-gray-600 text-center max-w-[200px]">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
