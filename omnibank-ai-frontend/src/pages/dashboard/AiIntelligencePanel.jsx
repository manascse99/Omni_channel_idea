import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { Sparkles, BarChart3 } from 'lucide-react';

export default function AiIntelligencePanel() {
  const [insight, setInsight] = useState('AI is analyzing real-time patterns...');

  useEffect(() => {
    api.get('/analytics/overview')
      .then(res => {
        const { topIntent } = res.data;
        if (topIntent && topIntent.name !== 'None') {
          setInsight(`OmniBank AI has detected a high volume of ${topIntent.name} queries. Recommend prioritizing manual response flow for this category.`);
        } else {
          setInsight('OmniBank AI is monitoring incoming traffic. Current volume is stable across all manual channels.');
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-xl border border-gray-100 h-full flex flex-col relative overflow-hidden group">
      {/* Decorative glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal/30 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-teal">
          <Sparkles size={18} fill="currentColor" />
          <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase">AI Intelligence</h2>
        </div>
        
        <p className="text-[14px] text-gray-300 leading-relaxed mb-6 pr-4 italic">
          {insight}
        </p>
      </div>

      <div className="relative z-10 w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <BarChart3 size={18} className="text-teal" />
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Analysis Active</span>
      </div>
    </div>
  );
}
