import { Calendar, MessageSquare, Sparkles, Smile, Target } from 'lucide-react';
import { useParams } from 'react-router-dom';
import VolumeChart from './VolumeChart';
import ChannelDonut from './ChannelDonut';
import IntentBreakdown from './IntentBreakdown';
import EscalationsTable from './EscalationsTable';
import SentimentAnalysis from './SentimentAnalysis';

export default function AnalyticsPage() {
  const { tab } = useParams();
  const activeTab = tab ? tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ') : 'Overview';

  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-[28px] font-extrabold text-primary tracking-tight leading-none mb-2">
             {activeTab === 'Overview' ? 'Sentiment & Intent Analytics' : `${activeTab} Analytics`}
           </h1>
           <p className="text-[13px] text-gray-500 font-medium">
             {activeTab === 'AI Metrics' ? 'Advanced AI performance and confidence reporting.' : 'Real-time intelligence dashboard for banking interactions.'}
           </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="text-[12px] font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Last 7 Days</button>
           <button className="text-[12px] font-bold text-white bg-primary px-4 py-2.5 rounded-lg shadow-sm border border-primary">Last 30 Days</button>
           <button className="text-[12px] font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <Calendar size={14} /> Custom Range
           </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
               <MessageSquare size={20} fill="currentColor" fillOpacity={0.2} />
             </div>
             <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-white">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
               +12%
             </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 mt-3">Total Messages</p>
            <p className="text-[32px] font-extrabold text-primary leading-none">15,420</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
               <Sparkles size={20} fill="currentColor" fillOpacity={0.2} />
             </div>
             <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-white">
               <Target size={12} className="text-green-500" /> Target Met
             </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 mt-3">AI Resolution Rate</p>
            <p className="text-[32px] font-extrabold text-primary leading-none">74%</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center">
               <Smile size={20} fill="currentColor" fillOpacity={0.2} />
             </div>
             <div className="flex text-amber-400 gap-0.5 mt-1">
               {[1,2,3,4].map(i => <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>)}
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
             </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 mt-3">Avg Sentiment</p>
            <p className="text-[32px] font-extrabold text-primary leading-none">4.2<span className="text-sm text-gray-400 font-medium">/5</span></p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal"></div>
          <div className="flex justify-between items-start ml-2">
             <div className="bg-teal/10 text-teal px-3 py-1 rounded text-[10px] font-bold">Top Intent</div>
          </div>
          <div className="ml-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 mt-3">Loan Inquiry</p>
            <div className="flex items-end justify-between">
              <p className="text-[32px] font-extrabold text-primary leading-none">64%</p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
               <div className="h-full bg-teal w-[64%] rounded-full"></div>
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
               <VolumeChart />
            </div>
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <ChannelDonut />
            </div>
          </div>

          {/* Row 3: Intent Breakdown & Sentiment Analysis */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <IntentBreakdown />
            </div>
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col">
               <SentimentAnalysis />
            </div>
          </div>
        </>
      )}

      {activeTab === 'Channels' && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100">
            <ChannelDonut />
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
                { label: 'Model Confidence', value: '92.4%' },
                { label: 'Intent Accuracy', value: '88.1%' },
                { label: 'Auto-Resolve', value: '64.2%' }
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

      {/* Row 4: Escalations Table */}
      <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col mb-12">
         <EscalationsTable />
      </div>
    </div>
  );
}
