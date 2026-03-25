import React, { useState } from 'react';
import { Cpu, Info } from 'lucide-react';

export default function AiConfigSection() {
  const [autoReply, setAutoReply] = useState(true);
  const [threshold, setThreshold] = useState(85);

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
            <Cpu size={20} />
          </div>
          <h3 className="text-[18px] font-bold text-primary">AI Configuration</h3>
        </div>
        <div className="bg-[#D9873E]/10 text-[#D9873E] px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
           <span className="w-1 h-1 rounded-full bg-[#D9873E] animate-pulse"></span>
           AI Insights Active
        </div>
      </div>

      <div className="space-y-10">
        {/* Auto-Reply Toggle */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <h4 className="text-[14px] font-bold text-primary mb-1">Global AI Auto-Reply</h4>
            <p className="text-[12px] text-gray-400 font-medium">Allow the AI to respond automatically to common inquiries.</p>
          </div>
          <button 
            onClick={() => setAutoReply(!autoReply)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${autoReply ? 'bg-teal' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${autoReply ? 'translate-x-[24px]' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Confidence Threshold */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[14px] font-bold text-primary">Confidence Score Threshold</h4>
            <div className="bg-primary text-white text-[11px] font-black px-3 py-1 rounded-lg">
              {threshold}%
            </div>
          </div>
          <div className="relative pt-1">
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={threshold} 
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal" 
            />
            <div className="flex justify-between mt-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cautious (50%)</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Strict (100%)</span>
            </div>
          </div>
        </div>

        {/* Intent Mapping */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h4 className="text-[14px] font-bold text-primary">Intent Mapping</h4>
            <Info size={14} className="text-gray-300" />
          </div>
          <div className="space-y-3">
             {[
               { intent: 'Loan Eligibility Inquiry', module: 'L_Module_01' },
               { intent: 'Balance Inquiry', module: 'B_Module_42' }
             ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal"></span>
                    <span className="text-[13px] font-bold text-primary">{item.intent}</span>
                  </div>
                  <div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-md border border-gray-200 uppercase tracking-tight">
                    Mapped to: <span className="text-primary">{item.module}</span>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
