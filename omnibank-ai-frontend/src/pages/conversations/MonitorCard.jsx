import React from 'react';
import { User, AlertCircle, MessageSquare, ShieldAlert, Cpu, Smile, Meh, Frown, Compass, ArrowRight } from 'lucide-react';

export default function MonitorCard({ data, onTakeOver }) {
  const { name, status, waiting, intent, sentiment, confidence, avatar } = data;

  const statusConfig = {
    'AI HANDLING': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: Cpu },
    'NEEDS ATTENTION': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
    'ESCALATED': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert },
  };

  const sentimentIcon = {
    'Positive': <Smile className="text-green-500" size={16} />,
    'Neutral': <Meh className="text-amber-500" size={16} />,
    'Urgent': <Frown className="text-red-500" size={16} />,
    'Curated': <Compass className="text-blue-500" size={16} />,
    'Curious': <Compass className="text-blue-500" size={16} />,
    'Frustrated': <Frown className="text-red-500" size={16} />,
  };

  const config = statusConfig[status] || statusConfig['AI HANDLING'];
  const StatusIcon = config.icon;

  const confidenceColor = confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className={`bg-white rounded-[24px] border-l-[6px] ${config.border.replace('border-', 'border-l-')} border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col relative`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
            <img src={avatar || `https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-primary flex items-center gap-1.5">
              {name}
              {status === 'AI HANDLING' && <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white"><MessageSquare size={10} fill="white" /></div>}
            </h4>
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
              <StatusIcon size={12} />
              {status}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Waiting</p>
          <p className="text-[14px] font-black text-primary">{waiting}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intent</p>
          <p className="text-[13px] font-bold text-primary truncate">{intent}</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sentiment</p>
          <div className="flex items-center gap-2">
            {sentimentIcon[sentiment]}
            <p className="text-[13px] font-bold text-primary">{sentiment}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-500">{confidence}% Confidence</p>
          {status === 'ESCALATED' && (
             <button 
               onClick={(e) => { e.stopPropagation(); onTakeOver(); }}
               className="bg-[#C83E3E] hover:bg-[#A82E2E] text-white text-[10px] font-bold py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors uppercase tracking-widest"
             >
               Take Over
             </button>
          )}
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${confidenceColor} transition-all duration-500`} 
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
