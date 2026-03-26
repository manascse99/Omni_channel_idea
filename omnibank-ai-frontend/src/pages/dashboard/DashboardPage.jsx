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
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-1.5 uppercase">
            {activeTab === 'Weekly' ? 'Weekly Performance Overview' : activeTab === 'Today' ? 'Today\'s Activity' : 'Real-time Performance'}
          </p>
          <h1 className="text-[32px] font-extrabold text-primary tracking-tight leading-none">Command Center</h1>
        </div>
        <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-200 shadow-sm transition-all hover:bg-amber-100 cursor-default">
          <Activity size={14} className={activeTab === 'Live' ? 'animate-pulse' : ''} />
          {activeTab === 'Live' ? 'AI Active: Optimizing response flow' : 'AI Offline Data: Processing historical trends'}
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
