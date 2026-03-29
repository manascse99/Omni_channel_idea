import { Mail, Phone, Calendar, Clock, Globe, MessageSquare } from 'lucide-react';

export default function UserProfileSidebar({ user }) {
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
      <div className="p-6 flex flex-col gap-6">
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
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Interaction History</label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={16} />
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Joined</p>
                <p className="text-[13px] font-bold text-gray-800">
                  {user.firstInteractionAt ? new Date(user.firstInteractionAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-gray-400" size={16} />
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Last Seen</p>
                <p className="text-[13px] font-bold text-gray-800">
                  {user.lastSeen ? new Date(user.lastSeen).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Online Now'}
                </p>
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
      </div>

      {/* Footer Branding */}
      <div className="mt-auto p-6 border-t border-gray-100">
        <div className="bg-[#0F2F55] p-4 rounded-xl">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">OmniBank Identity Verified</p>
           <p className="text-[12px] font-bold text-white">Consolidated Profile</p>
        </div>
      </div>
    </div>
  );
}
