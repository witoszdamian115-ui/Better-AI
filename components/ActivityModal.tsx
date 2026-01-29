
import React, { useState } from 'react';
import { X, History, Trash2, Calendar, MessageSquare, ExternalLink, Star, Bookmark } from 'lucide-react';
import { ChatSession, Message } from '../types';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onUpdateMessage
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'starred'>('recent');
  
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const starredMessages = sessions.flatMap(s => s.messages.filter(m => m.isStarred).map(m => ({...m, sessionId: s.id, sessionTitle: s.title})));

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1f20] w-full max-w-2xl rounded-[32px] border border-[#333] shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <History className="text-blue-400" size={24} />
              AI Orchestration Log
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[#333] rounded-full text-gray-400 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex gap-2 p-1 bg-[#131314] rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'recent' ? 'bg-white/5 text-blue-400 border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <History size={14} /> Recent Chats
            </button>
            <button 
              onClick={() => setActiveTab('starred')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'starred' ? 'bg-white/5 text-amber-400 border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Star size={14} /> Starred Insights
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'recent' ? (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#2a2b2c] rounded-full flex items-center justify-center mx-auto mb-4">
                     <History size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500">No activity found</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="group flex items-center justify-between p-4 bg-[#131314] rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all"
                  >
                    <div className="flex-1 min-w-0 pr-4 cursor-pointer" onClick={() => { onSelectSession(session.id); onClose(); }}>
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={14} className="text-blue-400" />
                        <h3 className="text-sm font-bold text-gray-200 truncate">{session.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>{formatDate(session.updatedAt)}</span>
                        <span>•</span>
                        <span>{session.messages.length} interactions</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { onSelectSession(session.id); onClose(); }}
                        className="p-2.5 hover:bg-blue-500/10 rounded-xl text-gray-400 hover:text-blue-400 transition-all"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteSession(session.id)}
                        className="p-2.5 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {starredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#2a2b2c] rounded-full flex items-center justify-center mx-auto mb-4">
                     <Bookmark size={32} className="text-amber-500 opacity-20" />
                  </div>
                  <p className="text-xs text-gray-500">No starred insights yet.<br/>Star messages in your chat to see them here.</p>
                </div>
              ) : (
                starredMessages.map((msg, i) => (
                  <div key={i} className="p-4 bg-[#131314] rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest flex items-center gap-1"><Star size={10} /> {msg.sessionTitle}</span>
                       <button onClick={() => { onSelectSession(msg.sessionId); onClose(); }} className="text-[10px] text-gray-600 hover:text-blue-400 transition-colors">GO TO CHAT</button>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed italic border-l-2 border-white/5 pl-4">{msg.parts.map(p => p.text).join(' ')}</p>
                    <div className="flex justify-end">
                       <button 
                        onClick={() => onUpdateMessage(msg.id, { isStarred: false })}
                        className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest p-1 transition-all"
                       >
                         Unstar
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-[#333] flex justify-between items-center bg-[#1e1f20]/50 rounded-b-[32px]">
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Localized Encrypted Memory</span>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
