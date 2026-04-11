import { useState, useEffect, useCallback } from 'react';
import api from '../../services/apiClient';
import { Search } from 'lucide-react';
import useSocketStore from '../../store/socketStore';
export default function ConversationList({ activeTab, activeConversationId, onSelect }) {
  const [convos, setConvos] = useState([]);
  const { socket } = useSocketStore();

  const fetchConversations = useCallback(() => {
    api.get('/conversations')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          _id: c._id,
          name: c.userId?.name || c.userId?.email || c.userId?.phone || 'Unknown User',
          time: new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lastMessage: c.lastMessage || 'No recent messages',
          unread: c.unreadCount || 0,
          tags: [
            { label: (c.lastChannel || 'Unknown').toUpperCase(), color: c.lastChannel === 'whatsapp' ? 'green' : c.lastChannel === 'email' ? 'gray' : c.lastChannel === 'telegram' ? 'blue' : c.lastChannel === 'discord' ? 'violet' : 'purple' }
          ],
          type: c.status === 'ai-handling' ? 'AI-Assisted' : c.lastChannel === 'whatsapp' ? 'Direct' : 'Channels',
          userId: c.userId // Keep the raw userId for badges/metadata
        }));
        setConvos(mapped);
    })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;
    
    // Auto-refresh the sidebar when new messages arise
    socket.on('new_message', fetchConversations);
    socket.on('conversation_updated', fetchConversations);
    
    socket.on('conversation_deleted', (data) => {
      console.log('[SOCKET] Removing merged conversation:', data.conversationId);
      setConvos(prev => prev.filter(c => c._id !== data.conversationId));
    });

    return () => {
      socket.off('new_message', fetchConversations);
      socket.off('conversation_updated', fetchConversations);
      socket.off('conversation_deleted');
    };
  }, [socket, fetchConversations]);

  const filtered = convos.filter(c => {
    if (!activeTab || activeTab === 'all') return true;
    return c.type.toLowerCase() === activeTab.replace('-', ' ').toLowerCase();
  });

  const getAvatar = (name) => {
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const colors = ['bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-green-500', 'bg-orange-500'];
    const charCodeSum = (name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return { initials, colorClass: colors[charCodeSum % colors.length] };
  };

  return (
    <div className="w-[380px] h-full border-r border-slate-200/60 flex flex-col bg-slate-50/50 backdrop-blur-xl shrink-0">
      {/* Local Filter Info */}
      <div className="px-6 py-5 border-b border-slate-200/50 bg-white/60 backdrop-blur-md">
        <p className="text-[11px] font-black text-[#00C9A7] uppercase tracking-widest leading-none">
          Viewing: {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') : 'All Conversations'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filtered.map((c, i) => {
          const avatar = getAvatar(c.name);
          const isActive = c._id === activeConversationId;
          
          return (
            <div key={i} onClick={() => onSelect(c._id)} className={`p-5 border-b border-slate-100/50 cursor-pointer transition-all duration-150 relative group overflow-hidden ${isActive ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/60'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-200 ${isActive ? 'bg-gradient-to-b from-[#00C9A7] to-emerald-500 scale-y-100' : 'bg-transparent scale-y-0 group-hover:bg-[#00C9A7]/30 group-hover:scale-y-[0.3]'}`}></div>
              <div className="flex gap-4 relative z-10">
                <div className={`w-11 h-11 rounded-[16px] ${avatar.colorClass} text-white flex items-center justify-center shrink-0 font-black text-sm border-2 border-white/80 shadow-inner group-hover:shadow-md transition-all ${isActive ? 'ring-2 ring-[#00C9A7]/20' : ''}`}>
                  {avatar.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className={`text-[14px] font-bold truncate pr-2 transition-colors duration-200 ${isActive ? 'text-[#00C9A7] text-transparent bg-clip-text bg-gradient-to-r from-[#00C9A7] to-teal-700' : 'text-slate-800 group-hover:text-[#00C9A7]'}`}>
                      {c.name}
                      {c.userId?.duplicateWarning && (
                        <span className="ml-2 inline-flex items-center text-orange-500" title="Possible Duplicate Profile Detected">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.time}</span>
                  </div>
                  <p className={`text-[12px] truncate mb-2.5 font-medium ${c.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{c.lastMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                 <div className="flex gap-1.5 grayscale opacity-70">
                   {c.userId?.channelHistory?.includes('whatsapp') && <span title="WhatsApp Connected" className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                   {c.userId?.channelHistory?.includes('email') && <span title="Email Connected" className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                   {c.userId?.channelHistory?.includes('telegram') && <span title="Telegram Connected" className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>}
                   {c.userId?.channelHistory?.includes('discord') && <span title="Discord Connected" className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                   {c.userId?.channelHistory?.includes('webchat') && <span title="Web Chat Connected" className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-auto">
                   Joined {c.userId?.firstInteractionAt ? new Date(c.userId.firstInteractionAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Unknown'}
                 </span>
                 {c.unread > 0 && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
