import React, { useState, useEffect } from 'react';
import { X, User, Search, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../../services/apiClient';

export default function EscalationModal({ isOpen, onClose, onEscalate, teamId, conversationId }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    if (isOpen && teamId) {
      setLoading(true);
      api.get(`/teams/${teamId}/agents`)
        .then(res => {
          setAgents(res.data.agents || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, teamId]);

  if (!isOpen) return null;

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">Escalate Case</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Select Domain Specialist</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 py-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search agents by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Agent List */}
        <div className="px-4 pb-4 max-h-[350px] overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-400 font-bold">Fetching specialists...</p>
              </div>
            ) : filteredAgents.length > 0 ? (
              filteredAgents.map(agent => (
                <button
                  key={agent._id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all border-2 ${
                    selectedAgent?._id === agent._id 
                    ? 'bg-teal/5 border-teal shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${selectedAgent?._id === agent._id ? 'text-teal' : 'text-gray-900'}`}>
                        {agent.name}
                      </p>
                      <p className="text-[11px] text-gray-400 font-bold">{agent.role.toUpperCase()} • {agent.status.toUpperCase()}</p>
                    </div>
                  </div>
                  {selectedAgent?._id === agent._id && (
                    <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-white">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-gray-400 font-bold">No agents found in this domain.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          <button
            disabled={!selectedAgent || loading}
            onClick={() => onEscalate(selectedAgent._id)}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 text-sm uppercase tracking-widest flex items-center justify-center gap-2 group"
          >
            Confirm Escalation
            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
