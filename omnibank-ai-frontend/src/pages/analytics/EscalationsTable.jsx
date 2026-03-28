import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { Eye, ArrowRight } from 'lucide-react';

export default function EscalationsTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/analytics/escalations')
      .then(res => {
        const escalations = res.data.escalations || [];
        const mapped = escalations.map(esc => ({
          id: esc._id,
          customer: esc.userId?.name || 'Unknown Customer',
          reason: esc.intent || 'High Sensitivity Query',
          agent: esc.assignedTo?.name || 'Unassigned',
          time: new Date(esc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          initials: (esc.userId?.name || 'UC').substring(0, 2).toUpperCase(),
          bg: esc.sentiment === 'Negative' ? 'bg-red-50' : 'bg-indigo-50',
          text: esc.sentiment === 'Negative' ? 'text-red-600' : 'text-primary'
        }));
        setData(mapped);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[15px] font-bold text-gray-900 tracking-wide">Top Escalations</h3>
        <button className="text-[11px] font-bold text-teal flex items-center gap-1 hover:text-teal/80 transition-colors">
          View All Report <ArrowRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto w-full border-t border-gray-100">
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-4">Customer Name</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Reason</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Agent Assigned</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Timestamp</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                <td className="py-5 pl-4">
                   <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm ${row.bg} ${row.text}`}>
                        {row.initials}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900 w-36 truncate block">{row.customer}</span>
                   </div>
                </td>
                <td className="py-5 text-[13px] text-gray-500 font-medium">{row.reason}</td>
                <td className="py-5">
                  <div className="flex items-center gap-3">
                     <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shadow-sm">
                       <img src={`https://ui-avatars.com/api/?name=${row.agent.replace(' ','+')}&background=random`} alt={row.agent} className="w-full h-full object-cover" />
                     </div>
                     <span className="text-[13px] font-bold text-gray-700">{row.agent}</span>
                  </div>
                </td>
                <td className="py-5 text-[12px] text-gray-400 font-medium">{row.time}</td>
                <td className="py-5 text-right pr-4">
                  <button className="p-2 text-teal hover:bg-teal/10 rounded-full transition-colors inline-block bg-teal/10">
                     <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-400 font-medium">No escalations currently tracked.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

