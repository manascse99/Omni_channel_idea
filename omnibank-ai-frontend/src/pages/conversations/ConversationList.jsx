import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { Search } from 'lucide-react';

export default function ConversationList({ activeTab, activeConversationId, onSelect }) {
  const [convos, setConvos] = useState([]);

  const fetchConversations = () => {
    api.get('/conversations')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          _id: c._id,
          name: c.userId?.name || c.userId?.email || c.userId?.phone || 'Unknown User',
          time: new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lastMessage: c.lastMessage || 'No recent messages',
          unread: c.unreadCount || 0,
          active: c._id === activeConversationId,
          tags: [
            { label: (c.lastChannel || 'Unknown').toUpperCase(), color: c.lastChannel === 'whatsapp' ? 'green' : c.lastChannel === 'email' ? 'gray' : c.lastChannel === 'telegram' ? 'blue' : c.lastChannel === 'discord' ? 'violet' : 'purple' }
          ],
          type: c.status === 'ai-handling' ? 'AI-Assisted' : c.lastChannel === 'whatsapp' ? 'Direct' : 'Channels',
          userId: c.userId // Keep the raw userId for badges/metadata
        }));
        setConvos(mapped);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

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
    <div className="w-[360px] h-full border-r border-gray-200 flex flex-col bg-[#F8FAFC] shrink-0">
      {/* Local Filter Info */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          Viewing: {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') : 'All Conversations'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((c, i) => {
          const avatar = getAvatar(c.name);
          return (
            <div key={i} onClick={() => onSelect(c._id)} className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${c.active ? 'bg-teal/5 border-l-[3px] border-l-teal' : 'bg-white hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}>
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full ${avatar.colorClass} text-white flex items-center justify-center shrink-0 font-black text-xs border border-white shadow-sm`}>
                  {avatar.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[13px] font-bold text-gray-900 truncate pr-2">{c.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400">{c.time}</span>
                  </div>
                  <p className={`text-[12px] truncate mb-2 ${c.unread > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{c.lastMessage}</p>
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
