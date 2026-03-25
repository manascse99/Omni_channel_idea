import { Sparkles } from 'lucide-react';

export default function SentimentAnalysis() {
  return (
    <div className="w-full flex-1 flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[15px] font-bold text-gray-900 tracking-wide">Sentiment Analysis</h3>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
           <Sparkles size={12} fill="currentColor" /> AI INSIGHTS
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-end gap-10 px-8">
        <div className="flex justify-center items-end gap-3 h-[140px]">
           <div className="flex flex-col items-center gap-3 w-1/3">
              <div className="w-full bg-teal rounded-t-sm transition-all" style={{height: '110px'}}></div>
              <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Positive</span>
           </div>
           <div className="flex flex-col items-center gap-3 w-1/3">
              <div className="w-full bg-gray-200 rounded-t-sm transition-all" style={{height: '40px'}}></div>
              <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Neutral</span>
           </div>
           <div className="flex flex-col items-center gap-3 w-1/3">
              <div className="w-full bg-gray-100 rounded-t-sm transition-all" style={{height: '15px'}}></div>
              <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Negative</span>
           </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#FDEBCE] p-5 rounded-2xl text-[13px] text-amber-800 font-medium italic text-center mb-2 shadow-sm leading-relaxed">
          "Sentiment has increased by 4.2% since the update of the automated loan module."
        </div>
      </div>
    </div>
  );
}
