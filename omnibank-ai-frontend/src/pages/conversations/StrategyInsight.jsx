import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';

export default function StrategyInsight() {
  return (
    <div className="mt-8 bg-[#050B1C] rounded-[24px] p-8 relative overflow-hidden flex items-center justify-between group shadow-xl border border-white/5">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#0F7A5E_0%,transparent_50%)]"></div>
        <div className="grid grid-cols-12 h-full gap-4 px-4">
          {[...Array(12)].map((_, i) => (
             <div key={i} className="h-full border-l border-white/5"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col max-w-2xl">
        <div className="flex items-center gap-2 bg-[#D9873E]/20 text-[#D9873E] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 w-fit">
          <TrendingUp size={12} />
          AI Strategy Insight
        </div>
        <h3 className="text-[28px] font-bold text-white mb-2 leading-tight">
          Automated resolution rate is up by 12% today.
        </h3>
        <p className="text-gray-400 text-[14px] leading-relaxed max-w-xl">
          The AI Agent is handling high volumes of "Personal Loan" queries with 94%+ confidence. No agent intervention is currently needed for this category.
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-8 pr-4">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center min-w-[140px] shadow-lg group-hover:bg-white/10 transition-colors">
          <p className="text-[32px] font-black text-teal leading-none mb-1">88%</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Auto-Resolve</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center min-w-[140px] shadow-lg group-hover:bg-white/10 transition-colors">
          <p className="text-[32px] font-black text-white leading-none mb-1">4.2</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Messages / Sec</p>
        </div>
      </div>

      {/* Floating bolt icon for style */}
      <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 bg-teal/10 rounded-full blur-[80px]"></div>
    </div>
  );
}
