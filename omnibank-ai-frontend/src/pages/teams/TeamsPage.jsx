import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TeamCard from '../../components/teams/TeamCard';
import AgentAvailabilityTable from '../../components/teams/AgentAvailabilityTable';
import AiLogicSection from '../../components/teams/AiLogicSection';
import { Landmark, ShieldAlert, Headphones, Sparkles } from 'lucide-react';

export default function TeamsPage() {
  const { tab } = useParams();
  const activeTab = tab ? tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ') : 'All Teams';
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
          <h2 className="text-[32px] font-black text-primary tracking-tight leading-none mb-2">
            {activeTab === 'All Teams' ? 'Teams & Assignment' : activeTab}
          </h2>
          <p className="text-[14px] text-gray-500 font-medium tracking-tight">
            {activeTab === 'Supervisors' ? 'Oversee platform performance and high-level routing.' : 'Manage departmental routing and agent utilization.'}
          </p>
        </div>

        {activeTab === 'All Teams' && (
          <div className="bg-[#F8FAFC] border border-gray-100 rounded-[20px] px-6 py-4 flex items-center gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={14} className="text-[#D9873E]" />
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
        )}
      </div>

      {activeTab === 'All Teams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {teams.map((team, idx) => (
            <TeamCard key={idx} {...team} />
          ))}
        </div>
      )}

      {activeTab === 'Agents' && (
        <div className="mb-10">
          <AgentAvailabilityTable />
        </div>
      )}

      {activeTab === 'Supervisors' && (
        <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6">
            <ShieldAlert size={40} />
          </div>
          <h3 className="text-2xl font-black text-primary mb-3">Supervisor Dashboard</h3>
          <p className="text-gray-500 max-w-lg mb-8">Access advanced controls, escalation overrides, and structural team management tools.</p>
          <button className="bg-primary text-white font-bold px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            Enter Management Console
          </button>
        </div>
      )}

      {activeTab === 'All Teams' && <AiLogicSection />}
      
      <div className="h-10"></div>
    </div>
  );
}
