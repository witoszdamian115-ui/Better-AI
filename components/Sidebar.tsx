
import React, { useState } from 'react';
import { ChatSession, User as UserType } from '../types';
import { Plus, MessageSquare, Settings, HelpCircle, History, X, LogOut, Search } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenActivity: () => void;
  user: UserType | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions, activeSessionId, onSelectSession, onNewChat, 
  isOpen, setIsOpen, onOpenSettings, onOpenHelp, onOpenActivity, 
  user, onLogout
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.messages.some(m => m.parts.some(p => p.text?.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1e1f20] transition-all duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col border-r border-white/5
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Search size={16} className="text-white" />
             </div>
             <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">GEMINI PRO</span>
          </div>
        </div>

        <div className="px-4 mb-6">
          <button onClick={onNewChat} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold transition-all text-gray-200 active:scale-95">
            <Plus size={18} className="text-blue-400" />
            <span>Start New Session</span>
          </button>
        </div>

        <div className="px-4 mb-4">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-3 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131314] border border-white/5 focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-300 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent Activity</div>
          {filteredSessions.length === 0 ? (
            <div className="px-4 py-8 text-center space-y-2">
              <History size={24} className="mx-auto text-gray-700" />
              <p className="text-xs text-gray-600">No matching threads</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => { onSelectSession(session.id); if (window.innerWidth < 768) setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all text-left group
                  ${activeSessionId === session.id ? 'bg-blue-500/10 text-blue-100 border border-blue-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
              >
                <MessageSquare size={16} className={`${activeSessionId === session.id ? 'text-blue-400' : 'text-gray-600'}`} />
                <span className="truncate flex-1 font-medium">{session.title}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 bg-[#131314]/50 border-t border-white/5 space-y-2">
          {[
            { icon: <HelpCircle size={18} />, label: 'Help', onClick: onOpenHelp },
            { icon: <Settings size={18} />, label: 'Settings', onClick: onOpenSettings }
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-2">
            <div className="flex items-center gap-3 p-3 bg-[#1e1f20] rounded-2xl border border-white/5">
              <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full border-2 border-white/10" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
