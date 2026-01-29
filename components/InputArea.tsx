
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Wand2, Sparkles, Zap, BookOpen, Stars, Code, Palette, FileText } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, imageData?: { mimeType: string, data: string }, mode?: 'chat' | 'image') => void;
  disabled: boolean;
  onOptimize: (draft: string) => Promise<string>;
  haptics: boolean;
}

const QUICK_ACTIONS = [
  { 
    icon: <Palette size={14} className="text-purple-400 animate-pulse" />, 
    label: '🎨 Generuj Obraz', 
    prompt: '', 
    mode: 'image' as const,
    className: 'bg-purple-500/15 border-purple-500/40 text-purple-200 hover:bg-purple-500/25 ring-1 ring-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
  },
  { 
    icon: <Code size={14} className="text-blue-400" />, 
    label: 'Kod', 
    prompt: 'Napisz kod dla: ', 
    mode: 'chat' as const,
    className: 'bg-[#1e1f20]/60 border-white/10 text-gray-400'
  },
  { 
    icon: <FileText size={14} className="text-amber-400" />, 
    label: 'Podsumuj', 
    prompt: 'Podsumuj to: ', 
    mode: 'chat' as const,
    className: 'bg-[#1e1f20]/60 border-white/10 text-gray-400'
  },
];

const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, onOptimize, haptics }) => {
  const [text, setText] = useState(() => localStorage.getItem('gemini_clone_draft') || '');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ mimeType: string, data: string } | null>(null);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('gemini_clone_draft', text);
  }, [text]);

  const triggerHaptic = () => {
    if (haptics && 'vibrate' in navigator) navigator.vibrate(10);
  };

  const handleSend = () => {
    if ((!text.trim() && !imageData) || disabled) return;
    triggerHaptic();
    onSend(text, imageData || undefined, mode);
    setText('');
    setPreview(null);
    setImageData(null);
    setMode('chat');
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    triggerHaptic();
    setMode(action.mode);
    if (action.prompt) {
      setText(action.prompt);
    }
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const handleOptimize = async () => {
    if (!text.trim() || isOptimizing) return;
    triggerHaptic();
    setIsOptimizing(true);
    try {
      const optimized = await onOptimize(text);
      setText(optimized);
    } finally { setIsOptimizing(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setPreview(event.target?.result as string);
        setImageData({ mimeType: file.type, data: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-8 bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e]/95 to-transparent pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-3xl mx-auto relative flex flex-col gap-4">
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action)}
              className={`flex items-center gap-2 px-5 py-2.5 backdrop-blur-md border rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 shadow-xl ${action.className}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        <div className={`relative rounded-[32px] p-2.5 border transition-all duration-500 backdrop-blur-3xl shadow-2xl ${mode === 'image' ? 'bg-purple-900/15 border-purple-500/50 ring-2 ring-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)]' : 'bg-[#1e1f20]/90 border-white/10 focus-within:border-blue-500/40'}`}>
          {preview && (
            <div className="relative inline-block m-3 p-2 bg-[#28292a] rounded-2xl border border-white/10 shadow-lg animate-in zoom-in duration-300">
              <img src={preview} className="h-20 w-20 rounded-xl object-cover" alt="preview" />
              <button onClick={() => { setPreview(null); setImageData(null); }} className="absolute -top-3 -right-3 bg-black text-white rounded-full p-2 border border-white/10 hover:bg-red-500 transition-colors shadow-xl"><X size={14} /></button>
            </div>
          )}
          
          <div className="flex items-end px-2">
            <div className="flex pb-2 px-1 gap-1 shrink-0">
               <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-2xl transition-all" title="Dodaj Media"><ImageIcon size={22} /></button>
               <button onClick={() => { triggerHaptic(); setMode(mode === 'image' ? 'chat' : 'image'); }} className={`p-3 rounded-2xl transition-all ${mode === 'image' ? 'bg-purple-600 text-white shadow-xl scale-110' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Tryb Generowania Obrazu"><Wand2 size={22} /></button>
               <button onClick={handleOptimize} disabled={!text.trim() || isOptimizing} className={`p-3 transition-all ${isOptimizing ? 'text-blue-400 animate-spin' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'}`} title="Ulepsz Prompt"><Stars size={22} /></button>
            </div>

            <textarea
              ref={textAreaRef}
              rows={1}
              value={text}
              onChange={(e) => { setText(e.target.value); adjustHeight(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) { e.preventDefault(); handleSend(); } }}
              placeholder={mode === 'image' ? "Opisz obraz, który chcesz stworzyć..." : "Zadaj pytanie..."}
              disabled={disabled}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white py-4 text-base md:text-sm resize-none max-h-48 custom-scrollbar placeholder:text-gray-600 font-medium"
            />

            <div className="flex pb-2 px-2 shrink-0">
              <button 
                onClick={handleSend} 
                disabled={(!text.trim() && !imageData) || disabled} 
                className={`p-4 rounded-full transition-all shadow-2xl active:scale-90 ${
                  (!text.trim() && !imageData) || disabled 
                    ? 'bg-white/5 text-gray-700' 
                    : mode === 'chat' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {disabled ? <Zap size={22} className="animate-spin" /> : <Send size={22} />}
              </button>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
};

export default InputArea;
