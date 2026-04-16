import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/apiClient';
import { Search, Mail, MessageSquare, Send, Hash, Globe, Sparkles, AlertCircle } from 'lucide-react';
import useSocketStore from '../../store/socketStore';

export default function ConversationList({ activeTab, activeConversationId, onSelect }) {
  const [convos, setConvos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
          status: c.status,
          lastChannel: c.lastChannel,
          type: c.status === 'ai-handling' ? 'AI-Assisted' : c.lastChannel === 'whatsapp' ? 'Direct' : 'Channels',
          userId: c.userId 
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
    
    socket.on('new_message', fetchConversations);
    socket.on('conversation_updated', fetchConversations);
    
    socket.on('conversation_deleted', (data) => {
      setConvos(prev => prev.filter(c => c._id !== data.conversationId));
    });

    return () => {
      socket.off('new_message', fetchConversations);
      socket.off('conversation_updated', fetchConversations);
      socket.off('conversation_deleted');
    };
  }, [socket, fetchConversations]);

  const filtered = useMemo(() => {
    return convos.filter(c => {
      const matchesTab = !activeTab || activeTab === 'all' || c.type.toLowerCase() === activeTab.replace('-', ' ').toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [convos, activeTab, searchQuery]);

  const getAvatarStyles = (name) => {
    const initials = (name || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
    const gradients = [
      'from-rose-500 to-pink-600',
      'from-fuchsia-500 to-purple-600',
      'from-indigo-500 to-blue-600',
      'from-sky-500 to-cyan-600',
      'from-teal-500 to-emerald-600',
      'from-lime-500 to-green-600',
      'from-yellow-500 to-orange-600',
      'from-orange-500 to-red-600'
    ];
    const charCodeSum = (name || 'U').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return { initials, gradient: gradients[charCodeSum % gradients.length] };
  };

  const ChannelIcon = ({ channel, size = 12 }) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare size={size} className="text-emerald-500" />;
      case 'email': return <Mail size={size} className="text-blue-500" />;
      case 'telegram': return <Send size={size} className="text-sky-500" />;
      case 'discord': return <Hash size={size} className="text-indigo-500" />;
      case 'webchat': return <Globe size={size} className="text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[400px] min-w-[320px] h-full border-r border-slate-200/60 flex flex-col bg-slate-50/20 backdrop-blur-3xl shrink-0 z-20">
      {/* Header with Search */}
      <div className="px-6 pt-7 pb-5 bg-white/50 backdrop-blur-md border-b border-slate-200/40">
        <div className="flex items-center justify-between mb-5">
           <h2 className="text-[18px] font-[900] text-[#020617] tracking-tight leading-none">
             Inbox
           </h2>
           <div className="flex items-center gap-2">
             <span className="px-2.5 py-1 bg-[#00C9A7]/10 text-[#00C9A7] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#00C9A7]/20 shadow-sm transition-all hover:bg-[#00C9A7]/20 cursor-default">
               {activeTab || 'All'}
             </span>
           </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#00C9A7] transition-colors z-10">
            <Search size={16} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white/70 border border-slate-200/50 rounded-2xl text-[13px] font-bold text-[#1e293b] placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-[#00C9A7]/5 focus:border-[#00C9A7]/40 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 opacity-60">
            <Search size={32} className="mb-2 opacity-20" />
            <p className="text-[12px] font-black uppercase tracking-widest">No results found</p>
          </div>
        ) : (
          filtered.map((c, i) => {
            const avatar = getAvatarStyles(c.name);
            const isActive = c._id === activeConversationId;
            const isAI = c.status === 'ai-processing' || c.status === 'ai-handling';
            
            return (
              <div 
                key={i} 
                onClick={() => onSelect(c._id)} 
                className={`mx-3 px-4 py-5 rounded-[28px] cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                  ? 'bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-[#00C9A7]/10 z-10 ring-1 ring-[#00C9A7]/5' 
                  : 'bg-transparent hover:bg-white/60'
                }`}
              >
                {/* Active Indicator Bar - Premium Teal Accent */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4.5px] h-[55%] rounded-r-full transition-all duration-300 ${
                  isActive ? 'bg-[#00C9A7] shadow-[0_0_12px_rgba(0,201,167,0.5)]' : 'bg-transparent group-hover:bg-[#00C9A7]/20 group-hover:opacity-100'
                }`}></div>

                <div className="flex gap-4 items-center">
                  {/* Avatar Section */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-[21px] bg-gradient-to-br ${avatar.gradient} text-white flex items-center justify-center font-black text-sm shadow-lg border-2 border-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]`}>
                      {avatar.initials}
                    </div>
                    {/* Status indicator on avatar */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-md">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#00C9A7] animate-pulse shadow-[0_0_8px_rgba(0,201,167,0.8)]' : 'bg-slate-300'}`}></div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className={`text-[14.5px] font-[900] truncate transition-colors duration-200 ${
                          isActive ? 'text-[#1e1b4b]' : 'text-[#334155] group-hover:text-[#1e1b4b]'
                        }`}>
                          {c.name}
                        </h4>
                        {isAI && <Sparkles size={12} className="text-[#00C9A7] shrink-0" />}
                        {c.userId?.duplicateWarning && (
                          <AlertCircle size={12} className="text-orange-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-black text-[#334155]/30 uppercase tracking-tight whitespace-nowrap ml-2">
                        {c.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[12px] truncate font-bold leading-relaxed ${
                        c.unread > 0 ? 'text-[#1e1b4b]' : 'text-[#334155]/50 group-hover:text-[#334155]/80'
                      }`}>
                        {c.lastMessage}
                      </p>
                      {c.unread > 0 && (
                        <span className="bg-[#00C9A7] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_10px_rgba(0,201,167,0.3)] animate-in zoom-in duration-300">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between mt-4 pl-[60px]">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 grayscale-[0.3] group-hover:grayscale-0 transition-all">
                      {c.userId?.channelHistory?.slice(0, 3).map((ch, idx) => (
                        <div key={idx} className="bg-white rounded-full p-1.5 shadow-sm border border-slate-100 transition-all hover:scale-125 hover:z-20 cursor-help" title={ch}>
                          <ChannelIcon channel={ch} size={11} />
                        </div>
                      ))}
                      {(c.userId?.channelHistory?.length > 3) && (
                        <div className="bg-[#1e1b4b] rounded-full w-5 h-5 flex items-center justify-center text-[7px] font-black text-[#00C9A7] border border-white shadow-sm">
                          +{c.userId.channelHistory.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-[#334155]/30 flex items-center gap-1 group-hover:text-[#00C9A7] transition-colors">
                    Joined {c.userId?.firstInteractionAt ? new Date(c.userId.firstInteractionAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
