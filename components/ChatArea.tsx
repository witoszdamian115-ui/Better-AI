
import React, { useRef, useEffect, useState } from 'react';
import { Message, Role, User as UserType } from '../types';
import { 
  User, Sparkles, ExternalLink, Globe, Copy, Check, Volume2, 
  MapPin, BrainCircuit, Star, Sparkle, Clock, Zap, Code, Image as ImageIcon, MessageSquare
} from 'lucide-react';
import { speakText, decodeBase64, decodeAudioData } from '../services/geminiService';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  user: UserType | null;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  voiceName: string;
  onSend: (text: string, imageData?: any, mode?: 'chat' | 'image') => void;
  personality: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping, user, onUpdateMessage, voiceName, onSend, personality }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTTS = async (text: string, id: string) => {
    if (playingId === id) return;
    setPlayingId(id);
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      const base64Audio = await speakText(text, voiceName);
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setPlayingId(null);
      source.start();
    } catch (e) { setPlayingId(null); }
  };

  const renderTextParts = (text: string, isUser: boolean) => {
    if (isUser) return <div className="whitespace-pre-wrap">{text}</div>;
    const segments = text.split(/(```[\s\S]*?```)/g);
    return segments.map((segment, idx) => {
      if (segment.startsWith('```')) {
        const match = segment.match(/```(\w+)?\n([\s\S]*?)\n```/);
        const lang = match?.[1] || 'code';
        const code = match?.[2] || '';
        return (
          <div key={idx} className="my-4 bg-[#0d0d0e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1f20] border-b border-white/5">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{lang}</span>
              <button onClick={() => handleCopy(code, `code-${idx}`)} className="p-1 text-gray-400 hover:text-blue-400 transition-colors"><Copy size={14} /></button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-blue-100/90 leading-relaxed"><code>{code}</code></pre>
          </div>
        );
      }
      return <div key={idx} className="mb-2 last:mb-0">{segment}</div>;
    });
  };

  const starterPrompts = [
    { icon: <ImageIcon size={24} className="text-purple-400" />, label: "🎨 Generuj Obraz", text: "Stwórz realistyczny obraz: ", mode: "image" as const, highlight: true },
    { icon: <Code size={20} className="text-blue-400" />, label: "Napisz Kod", text: "Napisz kod dla: " },
    { icon: <Zap size={20} className="text-amber-400" />, label: "Podsumuj", text: "Podsumuj ten tekst: " },
    { icon: <MessageSquare size={20} className="text-emerald-400" />, label: "Pomoc", text: "Jak mogę Ci dzisiaj pomóc?" }
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="relative group">
           <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-all duration-1000"></div>
           <Sparkles size={64} className="text-blue-400 relative z-10 animate-pulse" />
        </div>
        
        <div className="text-center space-y-3 relative z-10">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Witaj w Gemini Pro</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest opacity-60 italic">Czekam na Twoje polecenia</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl relative z-10">
          {starterPrompts.map((p, i) => (
            <button 
              key={i} 
              onClick={() => onSend(p.text, undefined, p.mode || 'chat')}
              className={`flex items-center gap-4 p-6 bg-[#1e1f20]/60 backdrop-blur-md border rounded-[28px] transition-all group hover:scale-[1.02] active:scale-95 text-left shadow-2xl ${p.highlight ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 hover:border-blue-500/30'}`}
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-all">
                {p.icon}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-black uppercase tracking-tight ${p.highlight ? 'text-purple-300' : 'text-white'}`}>{p.label}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Szybka Akcja</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth custom-scrollbar relative">
      <div className="max-w-3xl mx-auto space-y-12 pb-48">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-4 md:gap-6 group animate-in fade-in duration-300">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 overflow-hidden shadow-lg ${
              message.role === Role.USER ? 'bg-var-theme' : 'bg-transparent'
            }`} style={message.role === Role.USER ? { backgroundColor: 'var(--theme-color)' } : {}}>
              {message.role === Role.USER ? (
                user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="U" /> : <User size={20} className="text-white" />
              ) : <Sparkles size={28} className="text-blue-400" />}
            </div>
            
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex flex-col gap-4">
                {message.parts.map((part, i) => (
                  <div key={i} className="relative group/content">
                    {part.inlineData && (
                      <div className="mb-4 animate-in zoom-in-95 duration-500">
                        <img src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="AI Gen" className={`rounded-[28px] border border-white/10 shadow-2xl ${message.isImage ? 'w-full aspect-square object-cover' : 'max-w-md'}`} />
                      </div>
                    )}
                    {part.text && <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed text-[15px] font-medium">{renderTextParts(part.text, message.role === Role.USER)}</div>}
                  </div>
                ))}

                {message.role === Role.MODEL && message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-bottom-2">
                    {message.suggestions.map((s, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => onSend(s)} 
                        className="px-4 py-2 bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/10 hover:border-blue-500/30 rounded-2xl text-[11px] font-black uppercase tracking-wider text-blue-400 transition-all flex items-center gap-2 group/sug active:scale-95 shadow-md"
                      >
                        <Sparkle size={10} className="group-hover/sug:animate-spin" /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => handleCopy(message.parts.map(p => p.text).join(' '), message.id)}
                  className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                  title="Kopiuj wiadomość"
                >
                  {copiedId === message.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button 
                  onClick={() => handleTTS(message.parts.map(p => p.text).join(' '), message.id)}
                  className={`p-2 rounded-xl transition-all ${playingId === message.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10'}`}
                  title="Czytaj na głos"
                >
                  <Volume2 size={16} className={playingId === message.id ? 'animate-pulse' : ''} />
                </button>
                <button 
                  onClick={() => onUpdateMessage(message.id, { isStarred: !message.isStarred })}
                  className={`p-2 rounded-xl transition-all ${message.isStarred ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
                  title="Oznacz gwiazdką"
                >
                  <Star size={16} fill={message.isStarred ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4 md:gap-6 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-blue-400/50" />
            </div>
            <div className="flex-1 pt-3">
              <div className="h-4 bg-white/5 rounded-full w-2/3 mb-2"></div>
              <div className="h-4 bg-white/5 rounded-full w-1/2"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
