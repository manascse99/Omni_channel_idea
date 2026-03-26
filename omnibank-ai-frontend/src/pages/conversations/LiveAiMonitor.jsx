import React, { useState } from 'react';
import MonitorCard from './MonitorCard';
import StrategyInsight from './StrategyInsight';
import { Zap } from 'lucide-react';

export default function LiveAiMonitor({ onSelectCard, activeTab }) {
  const [filter, setFilter] = useState('All');

  const monitors = [
    { id: 1, name: 'Rajesh Kumar', status: 'AI HANDLING', waiting: '2m 14s', intent: 'Personal Loan', sentiment: 'Positive', confidence: 94, avatar: 'https://i.pravatar.cc/150?u=rajesh', channel: 'Direct' },
    { id: 2, name: 'Isha Patel', status: 'NEEDS ATTENTION', waiting: '5m 45s', intent: 'Credit Limit', sentiment: 'Neutral', confidence: 62, avatar: 'https://i.pravatar.cc/150?u=esha', channel: 'Channels' },
    { id: 3, name: 'Sameer Deshmukh', status: 'ESCALATED', waiting: '12m 02s', intent: 'Fraud Alert', sentiment: 'Urgent', confidence: 31, avatar: 'https://i.pravatar.cc/150?u=sameer', channel: 'Channels' },
    { id: 4, name: 'Kavita Reddy', status: 'AI HANDLING', waiting: '0m 45s', intent: 'Balance Query', sentiment: 'Positive', confidence: 98, avatar: 'https://i.pravatar.cc/150?u=kavita', channel: 'Direct' },
    { id: 5, name: 'Zaid Khan', status: 'AI HANDLING', waiting: '1m 30s', intent: 'New Credit Card', sentiment: 'Curious', confidence: 89, avatar: 'https://i.pravatar.cc/150?u=zaid', channel: 'Channels' },
    { id: 6, name: 'Anjali Gupta', status: 'NEEDS ATTENTION', waiting: '8m 22s', intent: 'App Login Issue', sentiment: 'Frustrated', confidence: 45, avatar: 'https://i.pravatar.cc/150?u=anjali', channel: 'Direct' },
    { id: 7, name: 'AI Bot 1', status: 'AI HANDLING', waiting: '0m 01s', intent: 'Greeting', sentiment: 'Positive', confidence: 99, avatar: 'https://i.pravatar.cc/150?u=bot1', channel: 'AI-Assisted' },
  ];

  const filteredMonitors = filter === 'All' 
    ? monitors 
    : monitors.filter(m => m.status.toLowerCase().includes(filter.toLowerCase().replace('handling', 'handling').replace('attention', 'attention').replace('escalated', 'escalated')));

  // Improved mapping for status to filter tabs
  const getFilteredMonitors = () => {
    let result = monitors;
    
    // Filter by Header Tab (Channel)
    if (activeTab && activeTab !== 'all') {
      const channelLabel = activeTab.replace('-', ' ').toLowerCase();
      result = result.filter(m => m.channel.toLowerCase() === channelLabel);
    }

    // Filter by Local Tab (Status)
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
            <p className="text-[11px] font-bold text-teal uppercase tracking-widest">Messages/Sec: 4.2</p>
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
      </div>

      <StrategyInsight />

      {/* Floating Action Button for manual override or quick actions */}
      <button className="fixed bottom-10 right-10 w-14 h-14 bg-teal rounded-2xl flex items-center justify-center text-primary shadow-2xl hover:scale-110 transition-transform z-50">
        <Zap size={24} fill="currentColor" />
      </button>
    </div>
  );
}
