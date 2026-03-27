import React from 'react';
import { AlertCircle, ShieldAlert, Cpu, Smile, Meh, Frown, Clock, ArrowUpRight, Zap } from 'lucide-react';

export default function MonitorCard({ data, onTakeOver }) {
  const { name, status, waiting, intent, sentiment, confidence, avatar, channel } = data;

  const statusConfig = {
    'AI HANDLING':     { accent: '#00CCA3', chipBg: '#F0FDF9', chipText: '#065F46', chipBorder: '#A7F3D0', Icon: Cpu        },
    'NEEDS ATTENTION': { accent: '#F59E0B', chipBg: '#FFFBEB', chipText: '#92400E', chipBorder: '#FDE68A', Icon: AlertCircle },
    'ESCALATED':       { accent: '#EF4444', chipBg: '#FEF2F2', chipText: '#991B1B', chipBorder: '#FECACA', Icon: ShieldAlert  },
  };

  const sentimentConfig = {
    positive:   { icon: <Smile size={13} />, bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
    neutral:    { icon: <Meh   size={13} />, bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
    negative:   { icon: <Frown size={13} />, bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
    Positive:   { icon: <Smile size={13} />, bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
    Neutral:    { icon: <Meh   size={13} />, bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
    Urgent:     { icon: <Frown size={13} />, bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
    Frustrated: { icon: <Frown size={13} />, bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  };

  const cfg = statusConfig[status] || statusConfig['AI HANDLING'];
  const StatusIcon = cfg.Icon;
  const sent = sentimentConfig[sentiment] || sentimentConfig['Neutral'];

  const barColor = confidence > 80 ? '#00CCA3' : confidence > 50 ? '#F59E0B' : '#EF4444';

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div
      className="group relative bg-white rounded-[22px] overflow-hidden flex flex-col cursor-pointer"
      style={{
        border: '1.5px solid #F0F2F5',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.10), 0 0 0 2px ${cfg.accent}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: cfg.accent, width: '100%' }} />

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 relative"
              style={{ background: `${cfg.accent}22`, color: cfg.accent, border: `1.5px solid ${cfg.accent}44` }}
            >
              {avatar
                ? <img src={avatar} alt={name} className="w-full h-full object-cover rounded-2xl" />
                : <span style={{ color: cfg.accent }}>{initials}</span>
              }
              {/* Live pulse */}
              <span
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: cfg.accent }}
              />
            </div>

            <div>
              <h4 className="text-[14px] font-black text-[#0F2F55] leading-tight truncate max-w-[140px]">{name}</h4>
              {/* Status chip */}
              <div
                className="inline-flex items-center gap-1 mt-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border"
                style={{ background: cfg.chipBg, color: cfg.chipText, borderColor: cfg.chipBorder }}
              >
                <StatusIcon size={9} />
                {status === 'AI HANDLING' ? 'AI Handling' : status === 'NEEDS ATTENTION' ? 'Needs Attention' : 'Escalated'}
              </div>
            </div>
          </div>

          {/* Wait time */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end text-gray-400 mb-0.5">
              <Clock size={9} />
              <span className="text-[9px] font-black uppercase tracking-widest">Waiting</span>
            </div>
            <p className="text-[14px] font-black text-[#0F2F55]">{waiting}</p>
          </div>
        </div>

        {/* Intent + Sentiment */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F8FAFD] rounded-2xl px-3.5 py-2.5 border border-[#EFF2F7]">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Intent</p>
            <p className="text-[12px] font-bold text-[#0F2F55] capitalize truncate">{intent}</p>
          </div>
          <div
            className="rounded-2xl px-3.5 py-2.5 border"
            style={{ background: sent.bg, borderColor: sent.border }}
          >
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Sentiment</p>
            <div className="flex items-center gap-1.5">
              <span style={{ color: sent.text }}>{sent.icon}</span>
              <p className="text-[12px] font-bold capitalize truncate" style={{ color: sent.text }}>{sentiment}</p>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AI Confidence</p>
            <span className="text-[11px] font-black" style={{ color: barColor }}>{confidence}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${confidence}%`, background: barColor }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] font-black text-gray-400 bg-gray-100 rounded-lg px-2.5 py-1 uppercase tracking-widest">
            {channel || 'Web'}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); onTakeOver(); }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl text-white transition-all"
            style={{
              background: status === 'ESCALATED' ? '#EF4444' : cfg.accent,
              opacity: status === 'ESCALATED' ? 1 : undefined,
            }}
          >
            {status === 'ESCALATED' ? 'Take Over' : 'Open Chat'} <ArrowUpRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
