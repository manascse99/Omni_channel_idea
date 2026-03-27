import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { ArrowRight, User, AlertTriangle } from 'lucide-react';

export default function RecentConversations() {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    api.get('/conversations?limit=3')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          name: c.userId?.name || c.userId?.phone || 'Unknown User',
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

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex-[1.5]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Recent Conversations</h3>
        <button className="text-[11px] font-bold text-teal uppercase flex items-center gap-1 hover:text-teal/80 transition-colors tracking-widest">
          View All Archive <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {convos.map((c, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-[12px] border border-gray-100 hover:border-teal/30 hover:shadow-sm bg-white transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-surface text-primary flex items-center justify-center shrink-0 font-bold border border-gray-200 shadow-inner group-hover:bg-teal group-hover:text-white transition-colors">
              {c.name === 'Adani Realty Group' ? 'AR' : <User size={18} />}
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
        ))}
      </div>
    </div>
  );
}
