import React from 'react';
import { AlertCircle, ShieldAlert, Cpu, Smile, Meh, Frown, Clock, ArrowRight, Zap, Mail, MessageSquare, Send } from 'lucide-react';

export default function MonitorCard({ data, onTakeOver }) {
  const { name, status, waiting, intent, sentiment, confidence, avatar, channel } = data;

  const statusConfig = {
    'AI HANDLING':     { accent: '#00CCA3', glow: 'rgba(0, 204, 163, 0.4)',  chipBg: 'bg-teal/5', chipText: 'text-teal', icon: Cpu },
    'NEEDS ATTENTION': { accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)',  chipBg: 'bg-amber-50', chipText: 'text-amber-700', icon: AlertCircle },
    'ESCALATED':       { accent: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)',  chipBg: 'bg-red-50', chipText: 'text-red-600', icon: ShieldAlert },
  };

  const sentimentConfig = {
    positive:   { icon: <Smile size={14} />, text: 'text-emerald-500', bg: 'bg-emerald-50/50' },
    neutral:    { icon: <Meh size={14}   />, text: 'text-slate-400',   bg: 'bg-slate-50/50' },
    negative:   { icon: <Frown size={14} />, text: 'text-rose-500',    bg: 'bg-rose-50/50' },
  };

  const cfg = statusConfig[status] || statusConfig['AI HANDLING'];
  const sent = sentimentConfig[sentiment?.toLowerCase()] || sentimentConfig['neutral'];
  const StatusIcon = cfg.icon;

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Progress Bar Color (Gradient Logic)
  const barGradient = confidence > 80 ? 'from-emerald-400 to-teal-500' : confidence > 50 ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-red-600';

  const channelIcon = {
    'whatsapp': <MessageSquare size={10} className="text-emerald-500" />,
    'email': <Mail size={10} className="text-slate-400" />,
    'web': <Zap size={10} className="text-amber-500" />,
    'telegram': <Send size={10} className="text-[#0088CC]" />,
  }[channel?.toLowerCase()] || <Zap size={10} className="text-amber-500" />;

  return (
    <div className="group relative">
      {/* Glow Backdrop */}
      <div 
        className="absolute -inset-0.5 rounded-[24px] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl"
        style={{ background: cfg.glow }}
      />
      
      {/* Card Body */}
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/40 rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col hover:-translate-y-1">
        
        {/* Left Glow Strip */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ 
            background: `linear-gradient(to bottom, ${cfg.accent}, transparent)`,
            boxShadow: `2px 0 10px ${cfg.glow}`
          }}
        />

        <div className="p-5 pl-7 flex flex-col gap-5 flex-1">
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              {/* Avatar with Super-Ellipse / Squircle look */}
              <div 
                className="w-12 h-12 rounded-[18px] relative flex shadow-sm border border-slate-100/50 overflow-visible"
                style={{ backgroundColor: `${cfg.accent}15` }}
              >
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover rounded-[18px]" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-sm" style={{ color: cfg.accent }}>
                    {initials}
                  </div>
                )}
                
                {/* Status Pulse */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full relative">
                    <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ backgroundColor: cfg.accent }}></span>
                    <span className="relative block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.accent }}></span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-black text-slate-900 tracking-tight leading-tight mb-1">{name}</h3>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-100/30 ${cfg.chipBg} ${cfg.chipText} text-[9px] font-black uppercase tracking-[0.1em]`}>
                  <StatusIcon size={10} strokeWidth={3} />
                  {status}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end text-slate-400 mb-1">
                <Clock size={10} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Wait Time</span>
              </div>
              <p className="text-[14px] font-black text-slate-900 tabular-nums">{waiting}</p>
            </div>
          </div>

          {/* Core Insights Pill Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/60 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Intent</span>
              <p className="text-[12px] font-bold text-slate-700 capitalize">{intent}</p>
            </div>
            <div className={`${sent.bg} backdrop-blur-sm border border-slate-100/50 rounded-2xl p-3 flex flex-col gap-1`}>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sentiment</span>
              <div className={`flex items-center gap-1.5 ${sent.text}`}>
                {sent.icon}
                <p className="text-[12px] font-bold capitalize">{sentiment}</p>
              </div>
            </div>
          </div>

          {/* AI Confidence Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu size={10} />
                  <span className="text-[9px] font-black uppercase tracking-widest">AI Confidence</span>
               </div>
               <span className="text-[11px] font-black text-slate-700">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden p-[1px]">
               <div 
                 className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                 style={{ width: `${confidence}%` }}
               />
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between pt-1">
             <div className="flex items-center gap-2 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100/50">
                {channelIcon}
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{channel || 'Web'}</span>
             </div>

             <button 
               onClick={(e) => { e.stopPropagation(); onTakeOver(); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 ${
                 status === 'ESCALATED' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-slate-900 text-teal shadow-slate-200'
               }`}
             >
                {status === 'ESCALATED' ? 'Take Over' : 'Open Chat'}
               <ArrowRight size={12} strokeWidth={3} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

