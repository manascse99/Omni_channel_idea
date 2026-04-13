import { Mail, Phone, Calendar, Clock, Globe, MessageSquare, Link2, ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import MergeProfileModal from './MergeProfileModal';

export default function UserProfileSidebar({ user, onProfileUpdated }) {
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* Header Profile Photo */}
      <div className="p-8 flex flex-col items-center border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-black text-2xl shadow-sm border-4 border-white">
          {(user.name || 'U')[0].toUpperCase()}
        </div>
        <h3 className="mt-4 text-[16px] font-bold text-gray-900">{user.name || 'Unknown User'}</h3>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Customer Profile</p>
      </div>

      {/* Details Section */}
      <div className="p-6 flex flex-col gap-6 flex-1">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Contact Information</label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Email</p>
                <p className="text-[13px] font-bold text-gray-800 truncate">{user.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Phone size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Phone</p>
                <p className="text-[13px] font-bold text-gray-800 truncate">{user.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

         <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Connected Channels</label>
            <div className="flex flex-wrap gap-2">
              {user.channelHistory?.map(ch => (
                <span key={ch} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  {ch === 'email' && <Mail size={12} className="text-blue-500" />}
                  {ch === 'webchat' && <Globe size={12} className="text-purple-500" />}
                  {ch === 'whatsapp' && <Phone size={12} className="text-green-500" />}
                  {ch === 'discord' && <MessageSquare size={12} className="text-indigo-500" />}
                  {ch}
                </span>
              ))}
            </div>
         </div>

         {/* Strategic Risk Profile - Minimalist & Clean */}
         <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> 
                Risk Intelligence
              </label>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                (user.riskScore || 0) > 70 ? 'bg-rose-100 text-rose-700' : (user.riskScore || 0) > 30 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {(user.riskScore || 0) > 70 ? 'High Risk' : (user.riskScore || 0) > 30 ? 'Medium' : 'Low Risk'}
              </div>
            </div>
            
            {/* SVG Minimalist Gauge */}
            <div className="relative flex justify-center">
              <svg width="120" height="70" viewBox="0 0 120 70">
                {/* Simplified Path */}
                <path 
                  d="M 15 60 A 45 45 0 0 1 105 60" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 15 60 A 45 45 0 0 1 105 60" 
                  fill="none" 
                  stroke={(user.riskScore || 0) > 70 ? '#f43f5e' : (user.riskScore || 0) > 30 ? '#f59e0b' : '#10b981'} 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeDasharray={`${(user.riskScore || 0) * 1.41}, 141`} 
                  className="transition-all duration-1000 ease-in-out"
                />
                {/* Simple Needle */}
                <g transform={`rotate(${-90 + (user.riskScore || 0) * 1.8}, 60, 60)`} className="transition-all duration-700">
                   <line x1="60" y1="60" x2="60" y2="25" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                   <circle cx="60" cy="60" r="3" fill="#1e293b" />
                </g>
              </svg>
              
              {/* Clean Score Center */}
              <div className="absolute top-[35px] flex flex-col items-center">
                <span className={`text-[28px] font-black tracking-tighter leading-none ${(user.riskScore || 0) > 70 ? 'text-rose-600' : (user.riskScore || 0) > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {user.riskScore || 0}
                </span>
              </div>
            </div>

            {/* Risk Signal Timeline - Compact */}
            {user.riskHistory && user.riskHistory.length > 0 && (
              <div className="mt-8 pt-4 border-t border-slate-200/60">
                <div className="space-y-4 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                  {user.riskHistory.slice().reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 items-start opacity-80 hover:opacity-100 transition-opacity">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${h.delta > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-bold text-slate-700 leading-tight mb-0.5">{h.reason}</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {h.delta > 0 ? `+${h.delta}` : h.delta} Points • {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                         </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
         </div>

        <div className="border-t border-gray-100 pt-6">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
             <Link2 size={12}/> Identity Merging
           </label>
           <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-500 font-bold pb-3">Safely consolidate duplicate customer profiles into a single unified timeline.</p>
             <button 
               onClick={() => setIsMergeModalOpen(true)}
               className="w-full bg-white border border-gray-200 text-[#0F2F55] py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:border-[#0F2F55]/20 transition-all shadow-sm flex items-center justify-center gap-2"
             >
               <Search size={14} /> Find Profile to Merge
             </button>
           </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="p-6 border-t border-gray-100">
        <div className="bg-[#0F2F55] p-4 rounded-xl">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">OmniBank Verified</p>
           <p className="text-[12px] font-bold text-white tracking-widest">Profile Consolidated</p>
        </div>
      </div>
      {/* Merge Modal */}
      <MergeProfileModal 
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        primaryUser={user}
        onMergeSuccess={(mergedUser) => {
          if (onProfileUpdated) onProfileUpdated(mergedUser);
        }}
      />
    </div>
  );
}
