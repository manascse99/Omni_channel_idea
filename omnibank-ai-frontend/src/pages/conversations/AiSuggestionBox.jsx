import { Sparkles, Check, Edit2 } from 'lucide-react';

export default function AiSuggestionBox({ name, suggestion, onAccept, onEdit }) {
  const displaySuggestion = suggestion || `Hello ${name}, based on your query, I recommend...`;

  return (
    <div className="bg-[#FFF8F0] border border-[#FDEBCE] rounded-xl p-4 mb-3 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="bg-[#FF9500] p-2 rounded-lg text-white shrink-0 mt-0.5 shadow-sm">
          <Sparkles size={16} fill="currentColor" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] text-gray-800 font-medium leading-relaxed">
            <span className="font-bold text-[#FF9500] mr-1">AI Suggests:</span>
            "{displaySuggestion}"
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button 
              onClick={onAccept}
              className="bg-primary hover:bg-[#15335E] text-white text-[11px] font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
               <Check size={14} /> Accept & Send
            </button>
            <button 
              onClick={onEdit}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
               <Edit2 size={14} /> Edit Suggestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
