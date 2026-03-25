import React from 'react';

export default function AiLogicSection() {
  return (
    <div className="mt-8 flex gap-6">
      {/* Active Shield Card */}
      <div className="w-[300px] bg-[#050B1C] rounded-[24px] p-8 relative overflow-hidden flex flex-col justify-between shrink-0 shadow-xl border border-white/5">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-1">AI Logic Core</p>
          <h3 className="text-[28px] font-bold text-white leading-tight">Active Shield</h3>
        </div>
        
        <div className="relative z-10 mt-12">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Mappings</p>
          <p className="text-[42px] font-black text-white leading-none">242</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-[-20%] bottom-[-10%] w-[180px] h-[180px] bg-teal/10 rounded-full blur-[40px]"></div>
        <div className="absolute right-4 bottom-4 opacity-10">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
            <circle cx="50" cy="50" r="10" />
            <circle cx="20" cy="20" r="5" />
            <circle cx="80" cy="20" r="5" />
            <circle cx="20" cy="80" r="5" />
            <circle cx="80" cy="80" r="5" />
            <line x1="20" y1="20" x2="50" y2="50" stroke="white" strokeWidth="2" />
            <line x1="80" y1="20" x2="50" y2="50" stroke="white" strokeWidth="2" />
            <line x1="20" y1="80" x2="50" y2="50" stroke="white" strokeWidth="2" />
            <line x1="80" y1="80" x2="50" y2="50" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Auto-routing Accuracy Card */}
      <div className="flex-1 bg-[#F8FAFC] rounded-[24px] p-8 border border-gray-100 flex flex-col justify-between shadow-sm">
        <div className="flex justify-between items-start">
          <div>
             <h4 className="text-[16px] font-bold text-primary mb-1">Auto-routing Accuracy</h4>
             <p className="text-[12px] text-gray-500 font-medium">Intent classification success rate</p>
          </div>
          <div className="text-right">
             <p className="text-[32px] font-black text-[#0F7A5E] leading-none mb-1">99.2%</p>
             <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">+0.4% this week</p>
          </div>
        </div>

        <div className="mt-6 mb-8">
           <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal w-[99.2%] rounded-full shadow-[0_0_10px_rgba(15,122,94,0.3)]"></div>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-6 border-t border-gray-200/50">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Avg Latency</p>
            <p className="text-[20px] font-black text-primary">140ms</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Conflicts</p>
            <p className="text-[20px] font-black text-primary">0.02%</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Last re-sync</p>
            <p className="text-[20px] font-black text-primary">4m ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
