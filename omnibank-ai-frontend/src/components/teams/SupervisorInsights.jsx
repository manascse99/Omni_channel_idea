import React, { useState, useEffect } from 'react';
import { Target, Users, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import api from '../../services/apiClient';

export default function SupervisorInsights() {
  const [teams, setTeams] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  useEffect(() => {
    api.get('/teams')
      .then(res => setTeams(res.data.teams))
      .catch(console.error);
    
    api.get('/analytics/overview')
      .then(res => setOverallStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Teams', val: teams.length, icon: Users, clr: 'bg-blue-50 text-blue-500' },
          { label: 'Active Escalations', val: overallStats?.totalMessages ? (teams.reduce((acc, t) => acc + t.active, 0)) : 0, icon: AlertTriangle, clr: 'bg-red-50 text-red-500' },
          { label: 'Model Confidence', val: overallStats?.aiMetrics?.modelConfidence || '0%', icon: Target, clr: 'bg-teal/10 text-teal' },
          { label: 'AI Resolution', val: overallStats?.aiResolvedRate || '0%', icon: Zap, clr: 'bg-amber-50 text-amber-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.clr}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-[20px] font-black text-primary leading-none mt-1">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Team Performance Grid */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-[16px] font-black text-primary uppercase tracking-tight">Team Utilization & Speed</h3>
          <button className="text-teal text-[11px] font-bold uppercase hover:underline">Full Reports</button>
        </div>
        <div className="divide-y divide-gray-50">
          {teams.map((team, idx) => (
            <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4 w-1/3">
                <div className="w-1.5 h-8 bg-teal rounded-full" />
                <div>
                  <p className="text-[14px] font-black text-primary">{team.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{team.agents} Agents Online</p>
                </div>
              </div>
              
              <div className="flex-1 px-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Handling Capacity</span>
                  <span className="text-[11px] font-black text-primary">{Math.min(100, team.active * 15)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${team.active > 5 ? 'bg-red-400' : 'bg-teal'}`} 
                    style={{ width: `${Math.min(100, team.active * 15)}%` }} 
                  />
                </div>
              </div>

              <div className="w-1/4 flex flex-col items-end">
                <p className="text-[13px] font-black text-primary">{team.active} Active Cases</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Range</span>
                </div>
              </div>
              
              <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all ml-4">
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
