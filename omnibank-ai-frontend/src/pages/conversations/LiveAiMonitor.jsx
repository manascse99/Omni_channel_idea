import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/apiClient';
import MonitorCard from './MonitorCard';
import StrategyInsight from './StrategyInsight';
import { Zap } from 'lucide-react';
import useSocketStore from '../../store/socketStore';

export default function LiveAiMonitor({ onSelectCard, activeTab }) {
  const [filter, setFilter] = useState('All');
  const [monitors, setMonitors] = useState([]);
  const { socket } = useSocketStore();

  const timeSince = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const days = Math.floor(seconds / (3600 * 24));
    return `${days}d`;
  };

  const fetchConversations = useCallback(() => {
    api.get('/conversations')
      .then(res => {
        const mapped = (res.data.conversations || []).map(c => ({
          id: c._id,
          name: c.userId?.name || c.userId?.phone || 
                (c.lastChannel === 'telegram' ? `@ID_${c.userId?.telegramChatId}` : 
                 c.lastChannel === 'discord' ? `@ID_${c.userId?.discordUserId}` : 'Unknown User'),
          status: c.status === 'ai-handling' ? 'AI HANDLING' : c.status === 'escalated' ? 'ESCALATED' : 'NEEDS ATTENTION',
          waiting: timeSince(c.updatedAt),
          intent: c.intent || 'General',
          sentiment: c.sentiment || 'Neutral',
          confidence: c.aiConfidence || (c.status === 'ai-handling' ? 90 : c.status === 'escalated' ? 30 : 60),
          avatar: null,
          channel: c.lastChannel === 'whatsapp' ? 'Direct' : 
                   c.lastChannel === 'email' ? 'Channels' : 
                   c.lastChannel === 'telegram' ? 'Telegram' :
                   c.lastChannel === 'discord' ? 'Discord' : 'AI-Assisted'
        }));
        setMonitors(mapped);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for real-time updates via shared socket
    socket.on('new_message', fetchConversations);
    socket.on('conversation_updated', fetchConversations);

    return () => {
      socket.off('new_message', fetchConversations);
      socket.off('conversation_updated', fetchConversations);
    };
  }, [socket, fetchConversations]);

  const getFilteredMonitors = () => {
    let result = monitors;
    if (activeTab && activeTab !== 'all') {
      const channelLabel = activeTab.replace('-', ' ').toLowerCase(); // Filter text
      result = result.filter(m => {
        const itemChannel = m.channel.replace('-', ' ').toLowerCase(); // Normalized card channel
        return itemChannel === channelLabel;
      });
    }
    if (filter === 'AI Handling') result = result.filter(m => m.status === 'AI HANDLING');
    if (filter === 'Needs Attention') result = result.filter(m => m.status === 'NEEDS ATTENTION');
    if (filter === 'Escalated') result = result.filter(m => m.status === 'ESCALATED');
    return result;
  };

  const tabs = ['All', 'AI Handling', 'Needs Attention', 'Escalated'];

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#f4f7fb] relative">
      {/* Soft background ambient glows for the monitor space */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#00C9A7]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <h2 className="text-[28px] font-extrabold text-primary tracking-tight leading-none mb-2">Live AI Monitor</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[11px] font-bold text-teal uppercase tracking-widest">{monitors.length} Active Conversations</p>
          </div>
        </div>

        <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-md border border-white/50 shadow-sm">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2.5 rounded-xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${
                filter === t 
                  ? 'bg-white text-[#00C9A7] shadow-sm transform scale-[1.02] border border-white' 
                  : 'text-slate-500 hover:text-teal-600 hover:bg-white/50 border border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredMonitors().map(m => (
          <div key={m.id} onClick={() => onSelectCard(m.id)} className="cursor-pointer">
            <MonitorCard data={m} onTakeOver={() => onSelectCard(m.id)} />
          </div>
        ))}
        {getFilteredMonitors().length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-400 font-bold text-lg">
            No conversations here yet. Waiting for incoming messages…
          </div>
        )}
      </div>

      <StrategyInsight />

      <button className="fixed bottom-10 right-10 w-14 h-14 bg-teal rounded-2xl flex items-center justify-center text-primary shadow-2xl hover:scale-110 transition-transform z-50">
        <Zap size={24} fill="currentColor" />
      </button>
    </div>
  );
}
