import React, { useState } from 'react';
import TeamCard from '../../components/teams/TeamCard';
import AgentAvailabilityTable from '../../components/teams/AgentAvailabilityTable';
import AiLogicSection from '../../components/teams/AiLogicSection';
import { Landmark, ShieldAlert, Headphones } from 'lucide-react';

export default function TeamsPage() {
  const [autoAssign, setAutoAssign] = useState(true);

  const teams = [
    { 
      name: 'Loans Team', 
      tag: 'HIGH AUTHORITY', 
      agents: 12, 
      active: 45, 
      icon: Landmark, 
      avatars: ['https://i.pravatar.cc/150?u=a', 'https://i.pravatar.cc/150?u=b', 'https://i.pravatar.cc/150?u=c'] 
    },
    { 
      name: 'Grievance Team', 
      tag: 'CRITICAL', 
      agents: 8, 
      active: 12, 
      icon: ShieldAlert, 
      avatars: ['https://i.pravatar.cc/150?u=d', 'https://i.pravatar.cc/150?u=e', 'https://i.pravatar.cc/150?u=f'] 
    },
    { 
      name: 'General Support', 
      tag: 'STANDARD', 
      agents: 24, 
      active: 89, 
      icon: Headphones, 
      avatars: ['https://i.pravatar.cc/150?u=g', 'https://i.pravatar.cc/150?u=h', 'https://i.pravatar.cc/150?u=i'] 
    },
  ];

  return (
    <div className="p-10 max-w-[1400px] mx-auto h-full overflow-y-auto bg-white/50">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-[32px] font-black text-primary tracking-tight leading-none mb-2">Teams & Assignment</h2>
          <p className="text-[14px] text-gray-500 font-medium tracking-tight">Manage departmental routing and agent utilization.</p>
        </div>

        <div className="bg-[#F8FAFC] border border-gray-100 rounded-[20px] px-6 py-4 flex items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[#D9873E]">✨</span>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">AI Auto-Assignment</p>
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-none">Enable AI Auto-assignment based on intent</p>
          </div>
          <button 
            onClick={() => setAutoAssign(!autoAssign)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${autoAssign ? 'bg-teal' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${autoAssign ? 'translate-x-[24px]' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {teams.map((team, idx) => (
          <TeamCard key={idx} {...team} />
        ))}
      </div>

      <AgentAvailabilityTable />
      
      <AiLogicSection />
      
      <div className="h-10"></div>
    </div>
  );
}
