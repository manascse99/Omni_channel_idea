import React, { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { io } from 'socket.io-client';
import MonitorCard from './MonitorCard';
import StrategyInsight from './StrategyInsight';
import { Zap } from 'lucide-react';

export default function LiveAiMonitor({ onSelectCard, activeTab }) {
  const [filter, setFilter] = useState('All');
  const [monitors, setMonitors] = useState([]);

  useEffect(() => {
    fetchConversations();

    // Listen for real-time new conversations
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
    socket.on('new_message', () => fetchConversations());
    socket.on('conversation_updated', () => fetchConversations());

    return () => socket.disconnect();
  }, []);

  const fetchConversations = () => {
    api.get('/conversations')
      .then(res => {
        const mapped = res.data.conversations.map(c => ({
          id: c._id,
          name: c.userId?.name || c.userId?.phone || 'Unknown User',
          status: c.status === 'ai-handling' ? 'AI HANDLING' : c.status === 'escalated' ? 'ESCALATED' : 'NEEDS ATTENTION',
          waiting: timeSince(c.updatedAt),
          intent: c.intent || 'General',
          sentiment: c.sentiment || 'Neutral',
          confidence: c.status === 'ai-handling' ? 90 : c.status === 'escalated' ? 30 : 60,
          avatar: null,
          channel: c.lastChannel === 'whatsapp' ? 'Direct' : c.lastChannel === 'email' ? 'Channels' : 'AI-Assisted'
        }));
        setMonitors(mapped);
      })
      .catch(console.error);
  };

  const timeSince = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  const getFilteredMonitors = () => {
    let result = monitors;
    if (activeTab && activeTab !== 'all') {
      const channelLabel = activeTab.replace('-', ' ').toLowerCase();
      result = result.filter(m => m.channel.toLowerCase() === channelLabel);
    }
    if (filter === 'AI Handling') result = result.filter(m => m.status === 'AI HANDLING');
    if (filter === 'Needs Attention') result = result.filter(m => m.status === 'NEEDS ATTENTION');
    if (filter === 'Escalated') result = result.filter(m => m.status === 'ESCALATED');
    return result;
  };

  const tabs = ['All', 'AI Handling', 'Needs Attention', 'Escalated'];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F4F6F9]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[28px] font-extrabold text-primary tracking-tight leading-none mb-2">Live AI Monitor</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[11px] font-bold text-teal uppercase tracking-widest">{monitors.length} Active Conversations</p>
          </div>
        </div>

        <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all ${
                filter === t 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-primary'
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
