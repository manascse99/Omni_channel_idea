import React from 'react';
import { Send, Mail, Globe } from 'lucide-react';

export default function ChannelConfigSection() {
  const channels = [
    { 
      name: 'WhatsApp Business', 
      status: 'CONNECTED', 
      statusColor: 'text-teal bg-teal/10',
      desc: 'Last sync: 2 mins ago',
      icon: Send,
      color: 'bg-teal/10 text-teal'
    },
    { 
      name: 'Microsoft Outlook', 
      status: 'SYNCING', 
      statusColor: 'text-[#D9873E] bg-[#D9873E]/10',
      desc: 'Updating headers...',
      icon: Mail,
      color: 'bg-[#D9873E]/10 text-[#D9873E]'
    },
    { 
      name: 'Web SDK Chat', 
      status: 'ACTIVE', 
      statusColor: 'text-blue-500 bg-blue-50',
      desc: 'v2.4.0 Deployment',
      icon: Globe,
      color: 'bg-blue-500/10 text-blue-500'
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Globe size={20} />
        </div>
        <h3 className="text-[18px] font-bold text-primary">Channel Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channels.map((ch, i) => {
          const Icon = ch.icon;
          return (
            <div key={i} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className={`w-12 h-12 ${ch.color} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon size={24} />
              </div>
              
              <div className={`text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase mb-4 ${ch.statusColor}`}>
                {ch.status}
              </div>

              <h4 className="text-[15px] font-bold text-primary mb-1">{ch.name}</h4>
              <p className="text-[11px] text-gray-400 font-medium mb-8">{ch.desc}</p>

              <button className="w-full py-2.5 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl text-[11px] font-bold hover:bg-gray-100 transition-colors uppercase tracking-widest mt-auto">
                Configure
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
