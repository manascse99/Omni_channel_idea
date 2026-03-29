import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { Sparkles, BarChart3, Radio } from 'lucide-react';

export default function AiIntelligencePanel() {
  const [insight, setInsight] = useState('AI is analyzing real-time patterns...');

  useEffect(() => {
    api.get('/analytics/overview')
      .then(res => {
        const topIntent = res.data?.topIntent;
        if (topIntent && topIntent.name !== 'None') {
          setInsight(`OmniBank AI has detected a high volume of ${topIntent.name} queries. Recommend prioritizing manual response flow for this category.`);
        } else {
          setInsight('OmniBank AI is monitoring incoming traffic. Current volume is stable across all manual channels.');
        }
      })
      .catch(err => {
        console.error('AiIntelligencePanel Fetch Error:', err);
        setInsight('AI Intelligence is initializing real-time synchronization...');
      });
  }, []);

  return (
    <div className="bg-slate-900 rounded-[24px] p-7 shadow-2xl border border-white/5 h-full flex flex-col relative overflow-hidden group transition-all duration-500 hover:shadow-teal/10 hover:border-white/10">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-teal/30 transition-colors duration-700"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:border-teal/30 transition-colors">
                <Sparkles size={20} className="text-teal animate-spin-slow" />
             </div>
             <div>
                <h2 className="text-[11px] font-black tracking-[0.25em] text-white/90 uppercase">AI Intelligence</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></div>
                   <span className="text-[9px] font-bold text-teal/80 uppercase tracking-widest">Neural Sync Active</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-8 backdrop-blur-sm group-hover:bg-white/10 transition-all">
          <p className="text-[14px] text-slate-300 leading-relaxed font-medium">
            <span className="text-teal font-black mr-1">“</span>
            {insight}
            <span className="text-teal font-black ml-1">”</span>
          </p>
        </div>
      </div>

      <div className="mt-auto relative z-10 w-full bg-teal/10 border border-teal/20 rounded-2xl p-4 flex items-center justify-between group-hover:bg-teal/20 transition-all">
        <div className="flex items-center gap-3">
           <Radio size={16} className="text-teal" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Analysis Feed</span>
        </div>
        <div className="flex gap-1">
           {[1, 2, 3].map(i => (
             <div key={i} className={`w-1 h-3 bg-teal/40 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
           ))}
        </div>
      </div>
      
      {/* Add spin-slow to tailwind or use inline style if not present, assuming common tailwind config */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
}
