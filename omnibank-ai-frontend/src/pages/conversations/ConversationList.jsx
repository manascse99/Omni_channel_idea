import { Search } from 'lucide-react';

export default function ConversationList({ activeTab }) {
  const convos = [
    { name: 'Rajesh Kumar', time: '10:24 AM', msg: 'I would like to know the current interest rates for ho...', active: true, tags: [{label: 'WhatsApp', color: 'green'}], type: 'Direct' },
    { name: 'Anita Sharma', time: '09:15 AM', msg: 'Urgent: Transaction #8273 failed but amount was d...', unread: 2, tags: [{label: 'Email', color: 'gray'}], type: 'Channels' },
    { name: 'Vikram Malhotra', time: 'YESTERDAY', msg: 'Thank you for the quick resolution of my card issue.', tags: [{label: 'Web Chat', color: 'blue'}], type: 'Channels' },
    { name: 'Priya Singh', time: 'YESTERDAY', msg: 'Can I apply for a credit card online or visit the branch?', tags: [{label: 'WhatsApp', color: 'green'}], type: 'Direct' },
    { name: 'AI Assistant', time: 'JUST NOW', msg: 'Analyzing customer sentiment for ongoing loan inquiries...', tags: [{label: 'AI-Assisted', color: 'purple'}], type: 'AI-Assisted' },
  ];

  const filtered = convos.filter(c => {
    if (!activeTab || activeTab === 'all') return true;
    return c.type.toLowerCase() === activeTab.replace('-', ' ').toLowerCase();
  });

  return (
    <div className="w-[360px] h-full border-r border-gray-200 flex flex-col bg-[#F8FAFC] shrink-0">

      {/* Local Filter Info */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          Viewing: {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') : 'All Conversations'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((c, i) => (
          <div key={i} className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${c.active ? 'bg-teal/5 border-l-[3px] border-l-teal' : 'bg-white hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}>
            <div className="flex justify-between items-start mb-1.5">
               <h4 className="text-[14px] font-bold text-primary truncate">{c.name}</h4>
               <span className="text-[10px] font-bold text-gray-400">{c.time}</span>
            </div>
            <p className={`text-[13px] truncate mb-3 ${c.unread ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{c.msg}</p>
            <div className="flex items-center gap-2">
               {c.tags.map(t => (
                 <span key={t.label} className="text-[9px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded text-gray-500 flex items-center gap-1.5 shadow-sm">
                   {t.label === 'WhatsApp' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                   {t.label === 'Email' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>}
                   {t.label === 'Web Chat' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                   {t.label === 'AI-Assisted' && <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                   {t.label}
                 </span>
               ))}
               {c.unread && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{c.unread}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
