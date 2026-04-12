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

         {/* Strategic Risk Profile */}
         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
              <ShieldCheck size={14} className="text-teal" /> 
              Strategic Risk Profile
            </label>
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className={`text-[18px] font-black ${
                    (user.riskScore || 0) > 70 ? 'text-rose-600' : (user.riskScore || 0) > 30 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {user.riskScore || 0}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Current Score</span>
               </div>
               <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  (user.riskScore || 0) > 70 ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  (user.riskScore || 0) > 30 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
               }`}>
                  {(user.riskScore || 0) > 70 ? 'High Alert' : (user.riskScore || 0) > 30 ? 'Vigilance' : 'Healthy'}
               </div>
            </div>
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
