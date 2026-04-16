import { useParams } from 'react-router-dom';
import KpiRow from './KpiRow';
import AiIntelligencePanel from './AiIntelligencePanel';
import ActivityFeed from './ActivityFeed';
import RecentConversations from './RecentConversations';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  const { tab } = useParams();
  const activeTab = tab ? tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ') : 'Live';

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-full flex flex-col">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-500 mb-2 uppercase">
            {activeTab === 'Weekly' ? 'Weekly Performance Overview' : activeTab === 'Today' ? 'Today\'s Activity' : 'Real-time Performance'}
          </p>
          <h1 className="text-[36px] font-extrabold tracking-tight leading-none text-slate-900 group">
            Command Center <span className="text-gradient">AI</span>
          </h1>
        </div>
        <div className="glass-card !rounded-2xl !bg-white/60 px-5 py-2.5 text-xs font-bold flex items-center gap-3 border border-indigo-50 neo-shadow !shadow-sm transition-all hover:bg-white/90 cursor-default relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className={`w-2 h-2 rounded-full ${activeTab === 'Live' ? 'bg-emerald-500 animate-pulse-glow' : 'bg-amber-500'}`}></div>
          <span className={`${activeTab === 'Live' ? 'text-indigo-900' : 'text-amber-700'} relative z-10 font-bold`}>
            {activeTab === 'Live' ? 'AI Flow Optimizer Active' : 'Historical Data Mode'}
          </span>
        </div>
      </div>

      <KpiRow />

      <div className="flex gap-6 flex-1 min-h-0">
        <RecentConversations />
        <div className="flex-1 flex flex-col gap-6 w-[360px] max-w-[400px] shrink-0">
          <div className="shrink-0 h-[220px]">
             <AiIntelligencePanel />
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
