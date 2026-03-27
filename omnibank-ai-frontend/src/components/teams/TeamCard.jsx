import React from 'react';
import { Users, MoreVertical } from 'lucide-react';

export default function TeamCard({ name, tag, agents, active, avatars, icon: Icon }) { // eslint-disable-line no-unused-vars
  const tagColors = {
    'HIGH AUTHORITY': 'bg-indigo-900/20 text-indigo-400',
    'CRITICAL': 'bg-red-500/10 text-red-500',
    'STANDARD': 'bg-gray-100 text-gray-400'
  };

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[20px] font-bold text-primary mb-2">{name}</h3>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded tracking-[0.1em] uppercase ${tagColors[tag]}`}>
            {tag}
          </span>
        </div>
        <div className="text-gray-300">
          <Icon size={24} />
        </div>
      </div>

      <div className="flex gap-12 mb-8">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Agents</p>
          <p className="text-[24px] font-black text-primary leading-none">{agents}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
          <p className="text-[24px] font-black text-teal leading-none">{active}</p>
        </div>
      </div>

      <div className="flex items-center mb-10">
        <div className="flex -space-x-3 overflow-hidden">
          {avatars && avatars.length > 0 ? (
            avatars.map((url, i) => (
              <img 
                key={i} 
                className="inline-block h-10 w-10 rounded-full ring-4 ring-white object-cover" 
                src={url} 
                alt="Team member" 
              />
            ))
          ) : agents > 0 ? (
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white bg-gray-50 text-[10px] font-bold text-gray-400">
              <Users size={16} />
            </div>
          ) : null}
          
          {(() => {
            const iconsShown = avatars && avatars.length > 0 ? avatars.length : (agents > 0 ? 1 : 0);
            const remaining = agents - iconsShown;
            return remaining > 0 ? (
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white bg-gray-50 text-[10px] font-bold text-gray-400">
                +{remaining}
              </div>
            ) : null;
          })()}
        </div>
      </div>

      <button 
        onClick={() => window.location.href = '/conversations'}
        className="w-full bg-[#050B1C] hover:bg-black text-white font-bold py-4 rounded-[12px] transition-colors text-[13px]"
      >
        Assign Conversation
      </button>
    </div>
  );
}
