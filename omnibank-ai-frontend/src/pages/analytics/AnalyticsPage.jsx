import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { Calendar, Users, Sparkles, Smile, Target } from 'lucide-react';
import { useParams } from 'react-router-dom';
import VolumeChart from './VolumeChart';
import ChannelDonut from './ChannelDonut';
import IntentBreakdown from './IntentBreakdown';
import EscalationsTable from './EscalationsTable';
import SentimentAnalysis from './SentimentAnalysis';

export default function AnalyticsPage() {
  const { tab } = useParams();
  const activeTab = tab ? tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ') : 'Overview';
  const [days, setDays] = useState(30); // Default to Last 30 Days
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({ 
    totalMessages: 0, 
    totalUsers: 0,
    aiResolvedRate: '0%', 
    avgSentiment: '0.0', 
    topIntent: { name: 'None', rate: '0%' },
    sentimentTrend: '+0.0%',
    nps: '0',
    aiMetrics: {
      modelConfidence: '0%',
      intentAccuracy: '0%',
      autoResolveRate: '0%'
    }
  });

  useEffect(() => {
    let url = `/analytics/overview?days=${days}`;
    if (days === 'custom' && customRange.start && customRange.end) {
      url = `/analytics/overview?start=${customRange.start}&end=${customRange.end}`;
    }
    
    api.get(url)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, [days, customRange]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col overflow-y-auto">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
           <h1 className="text-[28px] font-extrabold text-primary tracking-tight leading-none mb-2">
             {activeTab === 'Overview' ? 'Sentiment & Intent Analytics' : `${activeTab} Analytics`}
           </h1>
           <p className="text-[13px] text-gray-500 font-medium">
             {activeTab === 'AI Metrics' ? 'Advanced AI performance and confidence reporting.' : 'Real-time intelligence dashboard for banking interactions.'}
           </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDays(7)}
              className={`text-[12px] font-bold ${days === 7 ? 'text-white bg-primary border-primary shadow-indigo-100/50 shadow-lg' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'} border px-4 py-2.5 rounded-lg transition-all duration-300`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setDays(30)}
              className={`text-[12px] font-bold ${days === 30 ? 'text-white bg-primary border-primary shadow-indigo-100/50 shadow-lg' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'} border px-4 py-2.5 rounded-lg transition-all duration-300`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setDays('custom')}
              className={`text-[12px] font-bold ${days === 'custom' ? 'border-[#2563eb] text-[#2563eb] bg-blue-50/50' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'} border-2 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300`}
            >
                <Calendar size={14} /> Custom Range
            </button>
          </div>
          
          {days === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
               <input 
                 type="date" 
                 className="text-[11px] font-bold border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                 value={customRange.start}
                 onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
               />
               <span className="text-gray-400 font-bold text-xs">—</span>
               <input 
                 type="date" 
                 className="text-[11px] font-bold border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                 value={customRange.end}
                 onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
               />
            </div>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
               <Users size={22} fill="currentColor" fillOpacity={0.2} />
             </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 px-2 py-1 bg-green-50 rounded-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                {stats.sentimentTrend}
              </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">Total Users Handled</p>
            <p className="text-[36px] font-extrabold text-primary leading-none">{stats.totalUsers ? stats.totalUsers.toLocaleString() : '0'}</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
             <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
               <Sparkles size={22} fill="currentColor" fillOpacity={0.2} />
             </div>
             <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 px-2 py-1 bg-green-50 rounded-lg">
               <Target size={12} className="text-green-500" /> Target Met
             </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">AI Resolution Rate</p>
            <p className="text-[36px] font-extrabold text-primary leading-none">{stats.aiResolvedRate}</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
               <Smile size={22} fill="currentColor" fillOpacity={0.2} />
             </div>
             <div className="flex text-amber-400 gap-1 mt-1">
               {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(Number(stats.avgSentiment)) ? "currentColor" : "none"} stroke={i <= Math.round(Number(stats.avgSentiment)) ? "none" : "currentColor"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>)}
             </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">Avg Sentiment</p>
            <p className="text-[36px] font-extrabold text-primary leading-none">{stats.avgSentiment}<span className="text-sm text-gray-400 font-medium">/5</span></p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal"></div>
          <div className="flex justify-between items-start ml-2">
             <div className="bg-teal/10 text-teal px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">Top Intent</div>
          </div>
          <div className="ml-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4">{stats.topIntent.name}</p>
            <div className="flex items-end justify-between">
              <p className="text-[36px] font-extrabold text-primary leading-none">{stats.topIntent.rate}</p>
            </div>
            <div className="w-full h-2 bg-gray-50 rounded-full mt-4 overflow-hidden border border-gray-100">
               <div className="h-full bg-teal rounded-full shadow-[0_0_8px_rgba(0,201,167,0.4)]" style={{ width: stats.topIntent.rate }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Layout based on activeTab */}
      {activeTab === 'Overview' && (
        <>
          {/* Row 2: Charts */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <VolumeChart days={days} customRange={customRange} />
            </div>
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <ChannelDonut days={days} customRange={customRange} />
            </div>
          </div>

          {/* Row 3: Intent Breakdown & Sentiment Analysis */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <IntentBreakdown days={days} customRange={customRange} />
            </div>
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <SentimentAnalysis days={days} customRange={customRange} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'Channels' && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100">
            <ChannelDonut days={days} customRange={customRange} />
          </div>
          <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 p-8 flex items-center justify-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Channel Performance Heatmap Coming Soon</p>
          </div>
        </div>
      )}

      {activeTab === 'AI Metrics' && (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-primary/5 rounded-[24px] p-10 border-2 border-dashed border-primary/20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-black text-primary mb-2">AI Precision Dashboard</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Deep dive into model confidence, intent accuracy, and automated resolution efficiency.</p>
            <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
              {[
                { label: 'Model Confidence', value: stats.aiMetrics?.modelConfidence || '0%' },
                { label: 'Intent Accuracy', value: stats.aiMetrics?.intentAccuracy || '0%' },
                { label: 'Auto-Resolve', value: stats.aiMetrics?.autoResolveRate || '0%' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row 5: Escalations Table */}
      <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col mb-12">
         <EscalationsTable />
      </div>
    </div>
  );
}

