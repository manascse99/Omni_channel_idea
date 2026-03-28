import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { 
  ArrowRight, Mail, MessageSquare, 
  Globe, CheckCircle2, Clock, Sparkles, ChevronRight 
} from 'lucide-react';

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageSquare,
  web: Globe,
  default: MessageSquare
};

const STATUS_CONFIG = {
  'ai-handling': { 
    label: 'AI Processing', 
    icon: Sparkles, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50/50', 
    dot: 'bg-indigo-500' 
  },
  'resolved': { 
    label: 'Resolved', 
    icon: CheckCircle2, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50/50', 
    dot: 'bg-emerald-500' 
  },
  'open': { 
    label: 'Waiting', 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50/50', 
    dot: 'bg-amber-500' 
  },
  'default': { 
    label: 'Active', 
    icon: Clock, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50/50', 
    dot: 'bg-blue-500' 
  },
};

export default function RecentConversations() {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    api.get('/conversations?limit=3')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          name: c.userId?.name || c.userId?.email || c.userId?.phone || 'Unknown User',
          time: new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          msg: c.lastMessage || 'No message context',
          channel: c.lastChannel || 'email',
          status: c.status || 'open'
        }));
        setConvos(mapped);
      })
      .catch(console.error);
  }, []);

  const getAvatarStyle = (name) => {
    const colors = [
      'from-indigo-500 to-purple-500', 
      'from-teal-400 to-emerald-500', 
      'from-amber-400 to-orange-500', 
      'from-blue-500 to-indigo-600',
      'from-rose-400 to-rose-600'
    ];
    const charCodeSum = (name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    return { initials, gradient: colors[charCodeSum % colors.length] };
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-[1.5] transition-all duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Sessions</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[12px] text-slate-500 font-medium">Monitoring 3 channels live</p>
          </div>
        </div>
        <button className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-50 transition-all">
          <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">View Archive</span>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      <div className="space-y-4">
        {convos.map((c, i) => {
          const avatar = getAvatarStyle(c.name);
          const ChannelIcon = CHANNEL_ICONS[c.channel] || CHANNEL_ICONS.default;
          const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.default;

          return (
            <div 
              key={i} 
              className="group relative flex items-center gap-5 p-5 rounded-[24px] border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
            >
              {/* Left Decoration */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${status.dot}`} />

              {/* Avatar Section */}
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-bold text-lg shadow-inner ring-4 ring-white`}>
                  {avatar.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-md flex items-center justify-center border border-slate-50 ring-2 ring-white">
                  <ChannelIcon size={12} className="text-slate-600" />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {c.name}
                  </h4>
                  <time className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{c.time}</time>
                </div>
                <p className="text-[13px] text-slate-500 truncate mb-3 font-medium line-clamp-1">
                  {c.msg}
                </p>
                <div className="flex items-center">
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} ${status.color} ring-1 ring-inset ring-current/10`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${c.status === 'ai-handling' ? 'animate-pulse' : ''}`} />
                    <span className="text-[11px] font-bold uppercase tracking-tight">{status.label}</span>
                  </span>
                </div>
              </div>
              
              {/* Action */}
              <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
