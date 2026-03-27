import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { Search } from 'lucide-react';

export default function ConversationList({ activeTab, activeConversationId, onSelect }) {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = () => {
    api.get('/conversations')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          _id: c._id,
          name: c.userId?.name || c.userId?.phone || 'Unknown User',
          time: new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          msg: c.lastMessage || 'No recent messages',
          unread: c.unreadCount || 0,
          active: c._id === activeConversationId,
          tags: [
            { label: (c.lastChannel || 'Unknown').toUpperCase(), color: c.lastChannel === 'whatsapp' ? 'green' : c.lastChannel === 'email' ? 'gray' : 'blue' }
          ],
          type: c.status === 'ai-handling' ? 'AI-Assisted' : c.lastChannel === 'whatsapp' ? 'Direct' : 'Channels'
        }));
        setConvos(mapped);
      })
      .catch(console.error);
  };

  const filtered = convos.filter(c => {
    if (!activeTab || activeTab === 'all') return true;
    return c.type.toLowerCase() === activeTab.replace('-', ' ').toLowerCase();
  });

  return (
    <div className="w-[360px] h-full border-r border-gray-200 flex flex-col bg-[#F8FAFC] shrink-0">

      {/* Local Filter Info */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          Viewing: {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') : 'All Conversations'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((c, i) => (
          <div key={i} onClick={() => onSelect(c._id)} className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${c.active ? 'bg-teal/5 border-l-[3px] border-l-teal' : 'bg-white hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}>
            <div className="flex justify-between items-start mb-1.5">
               <h4 className="text-[14px] font-bold text-primary truncate">{c.name}</h4>
               <span className="text-[10px] font-bold text-gray-400">{c.time}</span>
            </div>
            <p className={`text-[13px] truncate mb-3 ${c.unread ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{c.msg}</p>
            <div className="flex items-center gap-2">
               {c.tags.map(t => (
                 <span key={t.label} className="text-[9px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded text-gray-500 flex items-center gap-1.5 shadow-sm">
                   {t.label === 'WhatsApp' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                   {t.label === 'Email' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>}
                   {t.label === 'Web Chat' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                   {t.label === 'AI-Assisted' && <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                   {t.label}
                 </span>
               ))}
               {c.unread && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{c.unread}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
