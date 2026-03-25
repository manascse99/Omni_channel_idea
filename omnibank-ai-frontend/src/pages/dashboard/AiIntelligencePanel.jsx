import { Sparkles } from 'lucide-react';

export default function AiIntelligencePanel() {
  return (
    <div className="bg-primary text-white rounded-[16px] p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between border border-white/5">
      {/* Decorative glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal/30 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-teal">
          <Sparkles size={18} fill="currentColor" />
          <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase">AI Intelligence</h2>
        </div>
        
        <p className="text-[13px] text-gray-300 leading-relaxed mb-6 pr-4">
          OmniBank AI has detected an 8% surge in wire-transfer inquiries over the last hour. 
          Recommend updating the "Wire FAQ" automated response.
        </p>
      </div>

      <button className="relative z-10 w-full bg-teal/10 hover:bg-teal flex items-center justify-center gap-2 text-teal hover:text-white border border-teal/20 hover:border-transparent font-bold py-3.5 rounded-xl transition-all text-sm group">
        Apply Optimization
      </button>
    </div>
  );
}
