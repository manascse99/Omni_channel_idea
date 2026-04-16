import { AlertCircle, ShieldAlert, Cpu, Smile, Meh, Frown, Clock, ArrowRight, Zap, Mail, MessageSquare, Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MonitorCard({ data, onTakeOver }) {
  const navigate = useNavigate();
  const { name, status, waiting, intent, sentiment, confidence, avatar, channel } = data;

  const statusConfig = {
    'AI HANDLING':     { 
      gradient: 'from-[#34d399] to-[#0d9488]', 
      solid: '#10B981', 
      glow: 'shadow-[#0d9488]/20',     
      chipBg: 'bg-[#0f766e]/10',    
      chipText: 'text-[#0f766e] font-extrabold',       
      icon: Cpu,           
      border: 'border-[#ccfbf1]', 
      btn: 'bg-gradient-to-r from-slate-800 to-slate-900 text-[#2dd4bf] shadow-slate-900/20 hover:text-[#5eead4]' 
    },
    'NEEDS ATTENTION': { 
      gradient: 'from-[#00C9A7] to-[#047857]', 
      solid: '#00C9A7', 
      glow: 'shadow-[#00C9A7]/20',   
      chipBg: 'bg-[#ecfdf5]',       
      chipText: 'text-[#047857] font-extrabold',     
      icon: AlertCircle,   
      border: 'border-[#ccfbf1]', 
      btn: 'bg-gradient-to-r from-[#00C9A7] to-[#047857] text-white shadow-[#00C9A7]/20 hover:from-[#34d399] hover:to-[#059669]' 
    },
    'ESCALATED':       { 
      gradient: 'from-[#00897B] to-[#004D40]', 
      solid: '#00897B', 
      glow: 'shadow-[#00897B]/20',   
      chipBg: 'bg-rose-50',         
      chipText: 'text-rose-600 font-extrabold',     
      icon: ShieldAlert,   
      border: 'border-teal-100',  
      btn: 'bg-gradient-to-r from-[#00897B] to-[#004D40] text-white shadow-[#00897B]/10 hover:shadow-lg' 
    },
  };

  const sentimentConfig = {
    positive:   { icon: <Smile size={14} />, text: 'text-emerald-500', bg: 'bg-emerald-50/50' },
    neutral:    { icon: <Meh size={14}   />, text: 'text-slate-400',   bg: 'bg-slate-50/50' },
    negative:   { icon: <Frown size={14} />, text: 'text-rose-500',    bg: 'bg-rose-50/50' },
  };

  const cfg = statusConfig[status] || statusConfig['AI HANDLING'];
  const sent = sentimentConfig[sentiment?.toLowerCase()] || sentimentConfig['neutral'];
  const StatusIcon = cfg.icon;

  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
  
  const barGradient = confidence > 80 ? 'from-[#34d399] to-[#0d9488]' : confidence > 50 ? 'from-[#00C9A7] to-[#059669]' : 'from-[#fb7185] to-[#ef4444]';

  const channelIcon = {
    'whatsapp': <MessageSquare size={10} className="text-emerald-500" />,
    'email': <Mail size={10} className="text-slate-400" />,
    'web': <Zap size={10} className="text-amber-500" />,
    'telegram': <Send size={10} className="text-[#0088CC]" />,
  }[channel?.toLowerCase()] || <Zap size={10} className="text-amber-500" />;

  return (
    <div className="group relative z-10 hover:z-20">
      <div className={`relative glass-card !rounded-[24px] border ${cfg.border} overflow-hidden shadow-sm hover:neo-shadow transition-all duration-200 flex flex-col hover:-translate-y-1.5`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cfg.gradient} opacity-90`} />

        <div className="p-6 pt-7 flex flex-col gap-5 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[18px] relative flex items-center justify-center shadow-inner border-2 border-white/80 overflow-visible bg-gradient-to-br ${cfg.gradient}`}>
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover rounded-[16px]" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-[15px] text-white">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full relative">
                    <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ backgroundColor: cfg.solid }}></span>
                    <span className="relative block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.solid }}></span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">{name}</h3>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-100/30 shadow-sm ${cfg.chipBg} ${cfg.chipText} text-[9px] uppercase tracking-[0.1em]`}>
                  <StatusIcon size={12} strokeWidth={3} />
                  {status}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end text-slate-400 mb-1">
                <Clock size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">Wait Time</span>
              </div>
              <p className="text-[15px] font-extrabold text-slate-900 tabular-nums">{waiting}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1 relative z-20">
            <div className="glass-card !bg-slate-50/50 !rounded-[20px] p-4 flex flex-col gap-1.5 border border-white/80 shadow-sm relative overflow-hidden group-hover:border-indigo-100 transition-colors">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] z-10">Intent</span>
              <p className="text-[13px] font-extrabold text-slate-800 capitalize z-10">{intent}</p>
            </div>
            <div className={`glass-card !rounded-[20px] ${sent.bg} p-4 flex flex-col gap-1.5 border border-white/80 shadow-sm relative overflow-hidden transition-colors`}>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] z-10">Sentiment</span>
              <div className={`flex items-center gap-1.5 ${sent.text} z-10`}>
                {sent.icon}
                <p className="text-[13px] font-extrabold capitalize">{sentiment}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white flex flex-col gap-2 shadow-sm min-h-[90px]">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-teal/70">
                    <Cpu size={12} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">AI Strategic Summary</span>
                </div>
                {data.processingNotes && (
                   <span className="text-[9px] font-black text-amber-600/80 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm border border-amber-100 flex items-center gap-1">
                      <Zap size={10} /> Insight
                   </span>
                )}
             </div>
             <p className="text-[12px] leading-relaxed text-slate-600 font-bold italic line-clamp-3">
                {data.summary || "AI is analyzing this conversation..."}
             </p>
             {data.processingNotes && (
                <p className="text-[10px] text-amber-700/70 font-semibold bg-amber-50/50 p-2 rounded-lg border border-amber-100/30 mt-1">
                   {data.processingNotes}
                </p>
             )}
          </div>

          {status === 'ESCALATED' && data.escalationReason && (
             <div className="mt-2 px-4 py-3 bg-red-50/50 border border-red-100/50 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex items-start gap-2">
                   <ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-red-700/70 uppercase tracking-widest leading-none mb-1">Escalation Reason</span>
                      <p className="text-[11px] font-bold text-red-800/90 leading-tight">
                         {data.escalationReason}
                      </p>
                   </div>
                </div>
             </div>
          )}

          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu size={12} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em]">AI Confidence</span>
               </div>
               <span className="text-[12px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900">{confidence}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100/80 rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-200/50">
               <div 
                 className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-1000 shadow-sm relative overflow-hidden`}
                 style={{ width: `${confidence}%` }}
               >
                 <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white shadow-sm">
                   {channelIcon}
                   <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{channel || 'Web'}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/customers/${data.id}`); }}
                  className="w-8 h-8 flex items-center justify-center bg-white/70 backdrop-blur-md rounded-xl border border-white shadow-sm text-slate-400 hover:text-teal transition-all"
                  title="View Full Profile"
                >
                  <ExternalLink size={14} />
                </button>
             </div>

             <button 
               onClick={(e) => { e.stopPropagation(); onTakeOver(); }}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 border ${cfg.btn}`}
             >
                {status === 'ESCALATED' ? 'Take Over' : 'Open Chat'}
               <ArrowRight size={14} strokeWidth={3} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
