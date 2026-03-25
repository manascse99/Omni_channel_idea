import React, { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';

export default function SecuritySection() {
  const [mfa, setMfa] = useState(true);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-[18px] font-bold text-primary">Security</h3>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-primary">Multi-factor Authentication</h4>
            <button 
              onClick={() => setMfa(!mfa)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-300 flex items-center px-0.5 ${mfa ? 'bg-[#0F7A5E]' : 'bg-gray-300'}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 ${mfa ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">IP Whitelisting</label>
             <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] text-gray-500 font-medium truncate">
                   192.168.1.1, 10.0.0.45
                </div>
                <button className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors">
                   <Plus size={18} />
                </button>
             </div>
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Session Timeout</label>
             <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] text-primary font-bold outline-none appearance-none">
                <option>30 Minutes</option>
                <option>1 Hour</option>
                <option>4 Hours</option>
             </select>
          </div>
        </div>
      </div>

      {/* Placeholder for Branding or next section if needed, but for now matching the UI grid */}
      <div id="branding-placeholder"></div>
    </div>
  );
}
