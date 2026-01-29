
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import ActivityModal from './components/ActivityModal';
import LoginScreen from './components/LoginScreen';
import { Role, Message, ChatSession, AppSettings, User as UserType, GroundingChunk } from './types';
import { sendMessageStream, generateTitle, generateImage, optimizePrompt, generateSuggestions } from './services/geminiService';
import { Menu, Mic, X, Key, Download, Maximize2, Minimize2, ListMusic, BrainCircuit, RefreshCcw, Clock, AlertTriangle } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  model: 'gemini-3-flash-preview',
  thinkingBudget: 0,
  systemInstruction: 'You are Gemini Pro, a helpful and professional AI assistant.',
  temperature: 0.7,
  theme: 'blue',
  shareLocation: false,
  voiceName: 'Kore',
  personality: 'balanced',
  isZenMode: false,
  enableHaptics: true
};

const THEME_COLORS = { blue: '#3b82f6', purple: '#a855f7', emerald: '#10b981', rose: '#f43f5e', amber: '#f59e0b' };

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<UserType | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [apiError, setApiError] = useState<'quota' | 'key' | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) setApiError('key');
      }
    };
    checkKey();

    const sUser = localStorage.getItem('gemini_clone_user');
    if (sUser) setUser(JSON.parse(sUser));
    const sSessions = localStorage.getItem('gemini_clone_sessions');
    if (sSessions) {
      const parsed = JSON.parse(sSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    }
    const sSettings = localStorage.getItem('gemini_clone_settings');
    if (sSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(sSettings) });
  }, []);

  const handleSelectKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setApiError(null);
    }
  };

  const isQuotaError = (e: any) => {
    const errorStr = JSON.stringify(e).toLowerCase();
    return errorStr.includes("resource_exhausted") || errorStr.includes("429") || (e.status === 429);
  };

  useEffect(() => {
    if (user) localStorage.setItem('gemini_clone_user', JSON.stringify(user));
    localStorage.setItem('gemini_clone_sessions', JSON.stringify(sessions));
    localStorage.setItem('gemini_clone_settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--theme-color', THEME_COLORS[settings.theme]);
  }, [user, sessions, settings]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const handleUpdateMessage = (id: string, updates: Partial<Message>) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s, messages: s.messages.map(m => m.id === id ? { ...m, ...updates } : m)
    } : s));
  };

  const handleSend = async (text: string, imageData?: { mimeType: string, data: string }, mode: 'chat' | 'image' = 'chat') => {
    let currId = activeSessionId;
    if (!currId) {
      const ns = { id: Date.now().toString(), title: text.slice(0, 30) || 'Nowy czat', messages: [], updatedAt: Date.now() };
      setSessions(prev => [ns, ...prev]);
      setActiveSessionId(ns.id);
      currId = ns.id;
    }

    const startTime = Date.now();
    const uMsg: Message = { id: Math.random().toString(36).substr(2, 9), role: Role.USER, parts: [...(text ? [{ text }] : []), ...(imageData ? [{ inlineData: imageData }] : [])], timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === currId ? { ...s, messages: [...s.messages, uMsg], updatedAt: Date.now() } : s));
    setIsTyping(true);

    try {
      if (mode === 'image') {
        const b64 = await generateImage(text);
        const aiMsg: Message = { id: Math.random().toString(36).substr(2, 9), role: Role.MODEL, isImage: true, parts: [{ text: `Wizualizacja dla: "${text}"` }, { inlineData: { data: b64, mimeType: 'image/png' } }], timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === currId ? { ...s, messages: [...s.messages, aiMsg] } : s));
      } else {
        const hist = sessions.find(s => s.id === currId)?.messages || [];
        const stream = await sendMessageStream([...hist, uMsg], text, settings, imageData, location);
        let fullRes = '';
        const aiId = Math.random().toString(36).substr(2, 9);
        const mMsg: Message = { id: aiId, role: Role.MODEL, parts: [{ text: '' }], timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === currId ? { ...s, messages: [...s.messages, mMsg] } : s));

        for await (const chunk of stream) {
          fullRes += chunk.text || '';
          setSessions(prev => prev.map(s => s.id === currId ? {
            ...s,
            messages: s.messages.map(m => m.id === aiId ? { ...m, parts: [{ text: fullRes }] } : m)
          } : s));
        }

        const endTime = Date.now();
        const suggestions = await generateSuggestions(fullRes);
        setSessions(prev => prev.map(s => s.id === currId ? {
          ...s,
          messages: s.messages.map(m => m.id === aiId ? { ...m, suggestions, metrics: { latency: endTime - startTime } } : m)
        } : s));
      }

      if (activeSession && (activeSession.title === 'Nowy czat' || activeSession.messages.length <= 2)) {
          const t = await generateTitle(text, settings.model);
          setSessions(prev => prev.map(s => s.id === currId ? { ...s, title: t } : s));
      }
    } catch (e: any) {
      if (isQuotaError(e)) {
        setApiError('quota');
      } else {
        const errMsg: Message = { id: Math.random().toString(36).substr(2, 9), role: Role.MODEL, parts: [{ text: `Błąd połączenia: ${e.message || 'Spróbuj ponownie za chwilę.'}` }], timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === currId ? { ...s, messages: [...s.messages, errMsg] } : s));
      }
    } finally { setIsTyping(false); }
  };

  if (!user) return <LoginScreen onLogin={setUser} />;

  if (apiError === 'quota') {
    return (
      <div className="fixed inset-0 z-[250] bg-[#0d0d0e] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full"></div>
            <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-amber-500/30 relative">
              <Clock size={48} className="text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Osiągnięto limit</h2>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Darmowa wersja Gemini pozwala na określoną liczbę pytań na minutę. <span className="text-white">Nie musisz nic płacić!</span> Odczekaj około 60 sekund lub przełącz na swój drugi darmowy klucz API.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setApiError(null)} 
              className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-widest active:scale-95 shadow-xl transition-all hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <RefreshCcw size={20} /> Spróbuj ponownie
            </button>
            <button 
              onClick={handleSelectKey} 
              className="w-full bg-white/5 text-gray-400 py-4 rounded-3xl font-bold uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <Key size={14} /> Przełącz na inny klucz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (apiError === 'key') {
     return (
      <div className="fixed inset-0 z-[250] bg-[#0d0d0e] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-blue-500/20 rounded-[32px] flex items-center justify-center mx-auto border border-blue-500/30">
            <Key size={48} className="text-blue-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Brak Klucza</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Aby korzystać z aplikacji, wybierz darmowy klucz API Google Gemini.</p>
          </div>
          <button onClick={handleSelectKey} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-blue-500">
            Wybierz Klucz API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full overflow-hidden bg-[#0d0d0e] ${settings.isZenMode ? 'zen-mode' : ''}`}>
      {!settings.isZenMode && (
        <Sidebar sessions={sessions} activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} onNewChat={() => { const ns = { id: Date.now().toString(), title: 'Nowy czat', messages: [], updatedAt: Date.now() }; setSessions(p => [ns, ...p]); setActiveSessionId(ns.id); }} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onOpenSettings={() => setIsSettingsOpen(true)} onOpenHelp={() => setIsHelpOpen(true)} onOpenActivity={() => setIsActivityOpen(true)} user={user} onLogout={() => setUser(null)} />
      )}
      <main className="flex-1 flex flex-col relative min-w-0 z-10">
        <header className="flex items-center justify-between px-6 py-4 bg-[#0d0d0e]/60 backdrop-blur-2xl sticky top-0 z-30 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 md:hidden"><Menu size={20} /></button>
            <div className="font-black text-[10px] text-gray-500 uppercase tracking-widest truncate max-w-[120px]">{activeSession?.title || 'ORCHESTRATOR'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSettings({...settings, isZenMode: !settings.isZenMode})} className="p-2.5 text-gray-400 hover:bg-white/5 rounded-xl transition-all" title="Zen Mode"><Maximize2 size={18} /></button>
            <img src={user.avatar} className="w-9 h-9 rounded-xl border border-white/10" alt="U" />
          </div>
        </header>
        <ChatArea messages={activeSession?.messages || []} isTyping={isTyping} user={user} onUpdateMessage={handleUpdateMessage} voiceName={settings.voiceName} onSend={handleSend} personality={settings.personality} />
        <InputArea onSend={handleSend} disabled={isTyping} onOptimize={optimizePrompt} haptics={settings.enableHaptics} />
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={setSettings} onClearHistory={() => setSessions([])} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ActivityModal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} sessions={sessions} onSelectSession={setActiveSessionId} onDeleteSession={(id) => setSessions(p => p.filter(s => s.id !== id))} onUpdateMessage={handleUpdateMessage} />
    </div>
  );
};

export default App;
