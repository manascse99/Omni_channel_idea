import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import { Mail, Phone, Calendar, Clock, Globe, ArrowLeft, ShieldCheck, MessageSquare } from 'lucide-react';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    // Fetch Conversation which contains User + Messages
    api.get(`/conversations/${id}`)
      .then(res => {
        setUser(res.data.conversation.userId);
        setMessages(res.data.messages);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F6F9] text-gray-400 font-bold">
        Loading User Profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F6F9] gap-4">
        <p className="text-gray-400 font-bold">User not found or no conversation history.</p>
        <button onClick={() => navigate('/conversations')} className="text-teal font-bold flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Conversations
        </button>
      </div>
    );
  }

  const initials = (user.name || user.email || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Top Navigation */}
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Discovery</span>
            <ShieldCheck size={16} className="text-teal" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full p-8 flex flex-col gap-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-black text-3xl shadow-sm border-4 border-white">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-2xl font-black text-gray-900">{user.name || 'Unknown User'}</h1>
               <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100 uppercase tracking-widest">Active Customer</span>
            </div>
            <div className="flex flex-wrap gap-5">
               <div className="flex items-center gap-2 text-gray-500">
                  <Mail size={14} />
                  <span className="text-[13px] font-bold">{user.email || 'No Email'}</span>
               </div>
               <div className="flex items-center gap-2 text-gray-500">
                  <Phone size={14} />
                  <span className="text-[13px] font-bold">{user.phone || 'No Phone'}</span>
               </div>
               <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} />
                  <span className="text-[13px] font-bold">Joined {user.firstInteractionAt ? new Date(user.firstInteractionAt).toLocaleDateString() : 'N/A'}</span>
               </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Channel</p>
             <div className="flex gap-2">
                {user.channelHistory?.map(ch => (
                  <span key={ch} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    ch === 'email' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    {ch}
                  </span>
                ))}
             </div>
          </div>
        </div>

        {/* Conversation History Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-3">
              <MessageSquare size={20} className="text-teal" /> Unified Conversation History
            </h2>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{messages.length} Total Messages</span>
          </div>

          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
            {messages.map((msg, idx) => {
              const isUser = msg.senderType === 'user';
              const isAI = msg.senderType === 'ai';
              const time = new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={idx} className={`flex items-start gap-4 ${!isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border border-white shadow-sm ${
                    isUser ? 'bg-[#E5F5EF] text-[#0F7A5E]' : isAI ? 'bg-teal text-white' : 'bg-primary text-white'
                  }`}>
                    {isUser ? initials : isAI ? 'AI' : (msg.metadata?.agentId?.name ? msg.metadata.agentId.name[0] : 'AG')}
                  </div>
                  <div className={`flex flex-col max-w-[80%] ${!isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                       {!isUser && !isAI && msg.metadata?.agentId?.name && (
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Agent: {msg.metadata.agentId.name}</span>
                       )}
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                         msg.channel === 'email' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-purple-600 bg-purple-50 border-purple-100'
                       }`}>
                         via {msg.channel}
                       </span>
                    </div>
                    <div className={`rounded-[16px] px-5 py-3 text-[14px] leading-relaxed shadow-sm ${
                      isUser ? 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm' : 'bg-primary text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
