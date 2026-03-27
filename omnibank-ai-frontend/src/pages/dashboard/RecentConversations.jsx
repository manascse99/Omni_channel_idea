import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { ArrowRight, User, AlertTriangle } from 'lucide-react';

export default function RecentConversations() {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    api.get('/conversations?limit=3')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          name: c.userId?.name || c.userId?.email || c.userId?.phone || 'Unknown User',
          time: new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          msg: c.lastMessage || 'No message context',
          tags: [
            { label: (c.lastChannel || 'Unknown').toUpperCase(), color: c.lastChannel === 'whatsapp' ? 'green' : c.lastChannel === 'email' ? 'gray' : 'blue' },
            { label: (c.status || 'open').toUpperCase(), color: c.status === 'ai-handling' ? 'teal' : c.status === 'resolved' ? 'gray' : 'orange' }
          ]
        }));
        setConvos(mapped);
      })
      .catch(console.error);
  }, []);

  const badgeColors = {
    green: 'text-green-700 bg-green-50 border-green-200',
    red: 'text-red-700 bg-red-50 border-red-200',
    orange: 'text-orange-700 bg-orange-50 border-orange-200',
    teal: 'text-teal bg-teal/10 border-teal/20',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    gray: 'text-gray-600 bg-gray-100 border-gray-200'
  };

  const dotColors = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal',
    blue: 'bg-blue-500',
    gray: 'bg-gray-400'
  };

  const getAvatar = (name) => {
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const colors = ['bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-green-500', 'bg-orange-500'];
    const charCodeSum = (name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return { initials, colorClass: colors[charCodeSum % colors.length] };
  };

  return (
    <div className="bg-white rounded-[16px] p-8 shadow-md border border-gray-100 flex-[1.5] hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Recent Conversations</h3>
        <button className="text-[11px] font-bold text-teal uppercase flex items-center gap-1 hover:text-teal/80 transition-colors tracking-widest">
          View All Archive <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {convos.map((c, i) => {
          const avatar = getAvatar(c.name);
          return (
            <div key={i} className="flex gap-4 p-5 rounded-[12px] border border-gray-50 hover:border-teal/30 hover:shadow-lg bg-white transition-all cursor-pointer group">
              <div className={`w-10 h-10 rounded-full ${avatar.colorClass} text-white flex items-center justify-center shrink-0 font-black text-sm border border-white shadow-sm group-hover:scale-105 transition-transform`}>
                {avatar.initials}
              </div>
              <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="text-[14px] font-bold text-gray-900 truncate pr-4">{c.name}</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">{c.time}</span>
              </div>
              <p className="text-[13px] text-gray-500 truncate mb-3">{c.msg}</p>
              <div className="flex gap-2">
                {c.tags.map(tag => (
                  <span key={tag.label} className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${badgeColors[tag.color]}`}>
                    {tag.icon === 'alert' ? <AlertTriangle size={10} strokeWidth={3} /> : <span className={`w-1.5 h-1.5 rounded-full ${dotColors[tag.color]}`}></span>}
                    {tag.label}
                  </span>
                ))}
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
