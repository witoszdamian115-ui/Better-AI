
import React from 'react';
import { X, Trash2, Cpu, Palette, Map, UserCircle, Gauge, Activity, Vibration } from 'lucide-react';
import { AppSettings, AccentTheme, Personality } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, onClearHistory }) => {
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    onUpdateSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

  const themes: { id: AccentTheme; color: string }[] = [
    { id: 'blue', color: '#3b82f6' }, { id: 'purple', color: '#a855f7' }, 
    { id: 'emerald', color: '#10b981' }, { id: 'rose', color: '#f43f5e' },
    { id: 'amber', color: '#f59e0b' }
  ];

  const personalities: { id: Personality; label: string; desc: string }[] = [
    { id: 'balanced', label: 'Balanced', desc: 'Versatile natural responses.' },
    { id: 'creative', label: 'Creative', desc: 'Vivid and imaginative.' },
    { id: 'precise', label: 'Precise', desc: 'Factual and logical.' },
    { id: 'fast', label: 'Speed', desc: 'Rapid generation priority.' }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#1e1f20] w-full max-w-2xl rounded-[32px] border border-white/5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Activity className="text-blue-500" /> System Engine
            </h2>
            <p className="text-xs text-gray-500">Orchestrate your personal AI workspace.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-gray-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Palette size={14} /> UI Aura & Theme</div>
            <div className="flex gap-4 p-4 bg-[#131314] rounded-2xl border border-white/5">
              {themes.map((t) => (
                <button key={t.id} onClick={() => onUpdateSettings({...settings, theme: t.id})} className={`w-12 h-12 rounded-2xl border-4 transition-all ${settings.theme === t.id ? 'border-white scale-110 shadow-2xl shadow-blue-500/20' : 'border-transparent hover:scale-105 opacity-50'}`} style={{ backgroundColor: t.color }} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Gauge size={14} /> Consciousness Personality</div>
            <div className="grid grid-cols-2 gap-3">
              {personalities.map((p) => (
                <button key={p.id} onClick={() => onUpdateSettings({...settings, personality: p.id})} className={`p-4 rounded-2xl border text-left transition-all ${settings.personality === p.id ? 'bg-blue-600 border-blue-400' : 'bg-[#131314] border-white/5 hover:border-white/20'}`}>
                  <p className={`text-sm font-bold ${settings.personality === p.id ? 'text-white' : 'text-gray-200'}`}>{p.label}</p>
                  <p className={`text-[10px] mt-1 ${settings.personality === p.id ? 'text-blue-100' : 'text-gray-500'}`}>{p.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Cpu size={14} /> Interaction & Privacy</div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-[#131314] rounded-2xl border border-white/5 cursor-pointer hover:bg-[#1a1a1b]">
                <div className="space-y-0.5"><p className="text-sm font-bold text-gray-200">Haptic Feedback</p><p className="text-[10px] text-gray-600">Physical vibration on core interactions.</p></div>
                <input type="checkbox" name="enableHaptics" checked={settings.enableHaptics} onChange={handleChange} className="w-5 h-5 rounded-lg accent-blue-600" />
              </label>
              <label className="flex items-center justify-between p-4 bg-[#131314] rounded-2xl border border-white/5 cursor-pointer hover:bg-[#1a1a1b]">
                <div className="space-y-0.5"><p className="text-sm font-bold text-gray-200">Precise Geolocation</p><p className="text-[10px] text-gray-600">Grounding responses with local context.</p></div>
                <input type="checkbox" name="shareLocation" checked={settings.shareLocation} onChange={handleChange} className="w-5 h-5 rounded-lg accent-blue-600" />
              </label>
            </div>
          </section>

          <button onClick={() => confirm('Permanently wipe all interaction memory?') && onClearHistory()} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Trash2 size={14} /> Erase Local Memory
          </button>
        </div>

        <div className="p-8 border-t border-white/5 bg-[#131314]/50 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl">Confirm Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
