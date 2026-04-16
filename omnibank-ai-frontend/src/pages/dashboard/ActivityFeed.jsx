import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import { 
  CheckCircle2, MessageSquare, AlertTriangle, Clock, 
  ChevronRight, Zap, TrendingUp, Activity
} from 'lucide-react';

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' },
  alert:   { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  default: { icon: MessageSquare, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' },
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/activity')
      .then(res => setActivities(res.data.activities))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-1 flex flex-col hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
              <Activity size={16} />
           </div>
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Feed</h3>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="text-[10px] font-bold text-teal hover:underline flex items-center gap-1 group/btn"
        >
           View Log <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
      
      <div className="flex flex-col gap-7 relative flex-1">
        {/* Sophisticated Gradient Timeline Line */}
        <div className="absolute left-[17px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-teal/40 via-gray-100 to-transparent"></div>
        
        {activities.map((item, idx) => {
          const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.default;
          const Icon = cfg.icon;
          
          return (
            <div key={idx} className="flex gap-5 relative z-10 group/item cursor-default">
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-lg`}>
                <Icon size={16} className={cfg.color} />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[13px] font-black text-primary leading-tight group-hover/item:text-teal transition-colors">{item.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Clock size={10} /> {item.time}
                   </div>
                   <div className="h-1 w-1 rounded-full bg-gray-200"></div>
                   <span className="text-[9px] font-black text-teal bg-teal/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">System Event</span>
                </div>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-20">
             <Activity size={40} className="mb-3" />
             <p className="text-xs font-bold uppercase tracking-widest">No Recent Activity</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
