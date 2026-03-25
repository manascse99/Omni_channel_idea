import React from 'react';
import { Palette, Upload } from 'lucide-react';

export default function BrandingSection() {
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
          <Palette size={20} />
        </div>
        <h3 className="text-[18px] font-bold text-primary">Branding</h3>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
              <Upload size={20} />
           </div>
           <div>
              <h4 className="text-[13px] font-bold text-primary mb-1">Platform Logo</h4>
              <p className="text-[11px] text-gray-400 font-medium mb-1.5">SVG, PNG (max 500kb)</p>
              <button className="text-[11px] font-bold text-teal underline">Upload new</button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Color</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                 <div className="w-5 h-5 rounded bg-[#1A2B4A]"></div>
                 <span className="text-[12px] font-bold text-primary">#1A2B4A</span>
              </div>
           </div>
           <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Font Family</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[12px] font-bold text-primary outline-none">
                 <option>Inter UI</option>
                 <option>Outfit</option>
                 <option>Roboto</option>
              </select>
           </div>
        </div>

        <button className="w-full py-4 bg-[#15335E] hover:bg-primary text-white rounded-xl text-[13px] font-bold transition-all shadow-lg shadow-primary/10">
           Preview Branding
        </button>
      </div>
    </div>
  );
}
