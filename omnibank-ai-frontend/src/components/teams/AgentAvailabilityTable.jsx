import React, { useState, useEffect } from 'react';
import api from '../../services/apiClient';

export default function AgentAvailabilityTable() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.get('/agents')
      .then(res => {
        const mapped = res.data.agents.map(a => ({
          name: a.name,
          role: a.role.toUpperCase(),
          status: (a.status || 'Offline').charAt(0).toUpperCase() + (a.status || 'offline').slice(1),
          chats: a.activeChats || 0,
          resolved: a.resolvedToday || 0,
          avatar: `https://ui-avatars.com/api/?name=${a.name.replace(' ','+')}&background=random`
        }));
        setAgents(mapped);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[18px] font-bold text-primary">Agent Availability</h3>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-widest">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-black transition-colors uppercase tracking-widest shadow-lg shadow-black/10">
            Manage Shifts
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-100">
            <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agent Name</th>
            <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
            <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
            <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Active Chats</th>
            <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Resolved Today</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {agents.map((agent, i) => (
            <tr key={i} className="group hover:bg-gray-50 transition-colors">
              <td className="py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[14px] font-bold text-primary">{agent.name}</span>
                </div>
              </td>
              <td className="py-5 text-[14px] text-gray-500 font-medium">{agent.role}</td>
              <td className="py-5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-400'}`}></span>
                  <span className="text-[12px] font-bold text-gray-600">{agent.status}</span>
                </div>
              </td>
              <td className="py-5 text-[16px] font-black text-primary text-center">{agent.chats}</td>
              <td className="py-5 text-[16px] font-black text-primary text-right">{agent.resolved}</td>
            </tr>
          ))}
          {agents.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-center text-gray-400 font-medium">No agents found in database.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
