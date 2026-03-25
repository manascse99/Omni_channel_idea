import { Sparkles, Check, Edit2 } from 'lucide-react';

export default function AiSuggestionBox() {
  return (
    <div className="bg-[#FFF8F0] border border-[#FDEBCE] rounded-xl p-4 mb-3 shadow-md relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="bg-[#FF9500] p-2 rounded-lg text-white shrink-0 mt-0.5 shadow-sm">
          <Sparkles size={16} fill="currentColor" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] text-gray-800 font-medium leading-relaxed">
            <span className="font-bold text-[#FF9500] mr-1">AI Suggests:</span>
            "Rajesh, based on your profile, you are eligible for an instant loan of up to ₹7,50,000 at 10.25%. Would you like to proceed with the documentation?"
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button className="bg-primary hover:bg-[#15335E] text-white text-[11px] font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
               <Check size={14} /> Accept & Send
            </button>
            <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
               <Edit2 size={14} /> Edit Suggestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
