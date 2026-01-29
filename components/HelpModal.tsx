
import React from 'react';
import { X, HelpCircle, Sparkles, Image as ImageIcon, Zap, Command, Keyboard, Smartphone, Download, ExternalLink, Stars, Maximize2, ListMusic } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentUrl = "https://ai.studio/apps/drive/10gJrFyO-1CL8tqLM5WbG-LBX-FWbKyvZ?fullscreenApplet=true";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    alert("URL Copied! Now go to PWABuilder.com");
  };

  const sections = [
    {
      icon: <Download className="text-blue-400" size={20} />,
      title: "Android APK & PWA",
      content: "Install via browser menu or package as .apk using PWABuilder.com for a native Android experience.",
      action: { label: "Copy App URL", onClick: handleCopyUrl }
    },
    {
      icon: <Stars className="text-amber-400" size={20} />,
      title: "Prompt Optimizer",
      content: "Click the stars icon in the input area to have the AI professionally rewrite and expand your request for better results."
    },
    {
      icon: <Maximize2 className="text-purple-400" size={20} />,
      title: "Zen Focus Mode",
      content: "Toggle the maximize icon in the header to enter a distraction-free workspace that hides all UI elements except the chat."
    },
    {
      icon: <ListMusic className="text-emerald-400" size={20} />,
      title: "Live Transcription Tape",
      content: "In Live Mode, a scrolling history of your conversation appears, allowing you to track audio interactions visually."
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1f20] w-full max-w-lg rounded-2xl border border-[#333] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HelpCircle className="text-blue-400" size={24} />
            Features & Help
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#333] rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid gap-6">
            {sections.map((section, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 mt-1">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-200 mb-1">{section.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">{section.content}</p>
                  {section.action && (
                    <button 
                      onClick={section.action.onClick}
                      className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-blue-600/30 transition-all flex items-center gap-2"
                    >
                      {section.action.label} <ExternalLink size={10} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#131314] rounded-xl p-4 border border-[#333]">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Keyboard size={14} />
              Power Tips
            </h3>
            <div className="space-y-2">
               <p className="text-[11px] text-gray-400">• Export any chat to a text file using the download icon.</p>
               <p className="text-[11px] text-gray-400">• Click the <strong>Brain</strong> icon in messages to see the AI's logic.</p>
               <p className="text-[11px] text-gray-400">• Use <strong>Magic Templates</strong> for common tasks like coding.</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#333] flex justify-center">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg"
          >
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
