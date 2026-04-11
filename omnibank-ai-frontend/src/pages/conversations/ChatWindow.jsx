import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/apiClient';
import { CheckCircle2, AlertTriangle, MoreVertical, ArrowLeft, Link2, ShieldCheck, Paperclip } from 'lucide-react';
import MessageInput from './MessageInput';
import EscalationModal from './EscalationModal';
import useSocketStore from '../../store/socketStore';
import UserProfileSidebar from './UserProfileSidebar';

export default function ChatWindow({ activeConversationId, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { socket, joinRoom, leaveRoom } = useSocketStore();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const fetchConversationData = useCallback(() => {
    if (!activeConversationId) return;
    
    api.get(`/conversations/${activeConversationId}`)
      .then(res => {
        setConversation(res.data.conversation);
        setMessages(res.data.messages || []);
        setLoading(false);
        scrollToBottom();

        // Auto-mark as read when opened
        if (res.data.conversation && !res.data.conversation.isRead) {
          api.patch(`/conversations/${activeConversationId}/read`)
            .catch(err => console.error('Auto-read error:', err));
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeConversationId, scrollToBottom]);

  useEffect(() => {
    fetchConversationData();
  }, [activeConversationId, fetchConversationData]);

  useEffect(() => {
    if (!activeConversationId || !socket) return;
    
    joinRoom(activeConversationId);

    const handleNewMessage = (data) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      leaveRoom(activeConversationId);
    };
  }, [activeConversationId, socket, joinRoom, leaveRoom, scrollToBottom]);

  const updateStatus = (newStatus) => {
    if (newStatus === 'escalate') {
      setIsEscalating(true);
      return;
    }
    api.post(`/conversations/${activeConversationId}/${newStatus}`)
      .then(() => {
        setConversation(prev => ({...prev, status: newStatus === 'resolve' ? 'resolved' : 'escalated'}));
      })
      .catch(console.error);
  };

  const handleEscalateConfirm = (targetAgentId) => {
    api.post(`/conversations/${activeConversationId}/escalate`, { targetAgentId })
      .then(res => {
        setConversation(prev => ({ ...prev, ...res.data.conversation }));
        setIsEscalating(false);
      })
      .catch(err => {
        console.error('Escalation failed:', err);
        setIsEscalating(false);
      });
  };

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F6F9] text-gray-400 font-bold">
        Select a conversation from the list to start messaging.
      </div>
    );
  }

  if (loading || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F6F9] text-gray-400 font-bold">
        Loading conversation...
      </div>
    );
  }

  const customerName = conversation.userId?.name || conversation.userId?.email || 'Customer';
  const initials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Find the subject from the first user message if it's an email
  const emailSubject = messages.find(m => m.channel === 'email' && m.senderType === 'user' && m.metadata?.emailSubject)?.metadata?.emailSubject || '';

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-[90px] border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 bg-white shadow-sm z-30 relative">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Back Button */}
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-xl border border-white/80 bg-white/50 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm transition-all mr-2 shrink-0 backdrop-blur-sm"
              title="Back to Monitor"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-emerald-100 to-teal-100 text-[#00C9A7] flex items-center justify-center font-black text-sm border-2 border-white shadow-sm shrink-0">
              {initials}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-black text-gray-900 truncate">
                  {customerName}
                </h2>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                    conversation.lastChannel === 'email' ? 'bg-blue-50 text-blue-600 border-blue-100/50' : 
                    conversation.lastChannel === 'telegram' ? 'bg-sky-50 text-sky-600 border-sky-100/50' :
                    conversation.lastChannel === 'discord' ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' :
                    'bg-teal/5 text-teal border-teal/10'
                  }`}>
                    {conversation.lastChannel === 'email' ? 'Email Thread' : conversation.lastChannel === 'telegram' ? 'Telegram' : conversation.lastChannel === 'discord' ? 'Discord' : conversation.lastChannel}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                    conversation.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100/50' :
                    conversation.status === 'escalated' ? 'bg-red-50 text-red-600 border-red-100/50' :
                    'bg-orange-50 text-orange-600 border-orange-100/50'
                  }`}>
                    {conversation.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col mt-0.5">
                <p className="text-[11px] text-gray-400 font-bold truncate tracking-tight">
                  {conversation.userId?.email || conversation.userId?.phone}
                </p>
                {emailSubject && (
                  <p className="text-[11px] text-primary font-black truncate max-w-md mt-0.5">
                    Subject: {emailSubject}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <button onClick={() => updateStatus('escalate')} className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white text-[11px] uppercase tracking-wider font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md">
              <AlertTriangle size={16} /> Escalate
            </button>
            <button onClick={() => updateStatus('resolve')} className="h-10 px-5 bg-teal hover:brightness-95 text-white text-[11px] uppercase tracking-wider font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md">
              <CheckCircle2 size={16} /> Resolve
            </button>
            <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ml-1 border border-transparent ${isSidebarOpen ? 'bg-gray-100 text-gray-800 shadow-inner' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:border-gray-100'}`}
            title="Toggle User Profile"
          >
            <MoreVertical size={18} />
          </button>
        </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide bg-[#f4f7fb] z-10">
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            <div className="text-center my-4">
               <span className="bg-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Started {new Date(conversation.createdAt).toLocaleDateString()}</span>
            </div>

            {[...messages].map((msg, index) => {
              const isUser = msg.senderType === 'user';
              const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

              return (
                <div key={index} className={`flex items-start gap-4 ${!isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-white shadow-sm ${
                    isUser ? 'bg-[#E5F5EF] text-[#0F7A5E]' : 'bg-primary text-white'
                  }`}>
                    {isUser ? initials : (msg.metadata?.agentId?.name ? msg.metadata.agentId.name[0].toUpperCase() : 'AG')}
                  </div>
                  <div className={`flex flex-col max-w-[75%] ${!isUser ? 'items-end' : 'items-start'}`}>
                    {/* Channel Badge & Agent Name */}
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      {!isUser && msg.metadata?.agentId?.name && (
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                          Agent: {msg.metadata.agentId.name}
                        </span>
                      )}
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        msg.channel === 'email' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                        msg.channel === 'whatsapp' ? 'text-green-600 bg-green-50 border-green-100' :
                        msg.channel === 'telegram' ? 'text-sky-600 bg-sky-50 border-sky-100' :
                        msg.channel === 'discord' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' :
                        'text-purple-600 bg-purple-50 border-purple-100'
                      }`}>
                        via {msg.channel === 'email' ? 'Email' : msg.channel === 'whatsapp' ? 'WhatsApp' : msg.channel === 'telegram' ? 'Telegram' : msg.channel === 'discord' ? 'Discord' : 'Web Chat'}
                      </span>
                    </div>

                    <div className={`rounded-[24px] px-6 py-4 text-[14px] shadow-sm leading-relaxed ${
                      isUser ? 'bg-white border border-slate-100 rounded-tl-[6px] text-slate-800' : 'bg-gradient-to-br from-[#00C9A7] to-teal-600 text-white rounded-tr-[6px] shadow-md border border-[#00C9A7]/30'
                    }`}>
                      {msg.metadata?.attachmentUrl && (
                        <div className="mb-3 mt-1">
                          {msg.metadata.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <div className="rounded-xl overflow-hidden shadow-sm border border-black/10 inline-block bg-white/5 p-1">
                              <img 
                                src={`http://localhost:5001${msg.metadata.attachmentUrl}`} 
                                alt="Attachment" 
                                className="max-w-[240px] max-h-[240px] rounded-lg object-contain" 
                              />
                            </div>
                          ) : (
                            <a 
                              href={`http://localhost:5001${msg.metadata.attachmentUrl}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`flex items-center gap-2 p-3 rounded-xl border transition-colors inline-flex max-w-[260px] ${
                                isUser ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-black/10 border-white/20 hover:bg-black/20 text-white'
                              }`}
                            >
                              <Paperclip size={16} className="shrink-0" />
                              <span className="font-bold underline underline-offset-2 truncate text-xs">{msg.metadata.fileName || 'View Attachment'}</span>
                            </a>
                          )}
                        </div>
                      )}
                      <div>{msg.content}</div>
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-2 font-bold tracking-wider uppercase ${!isUser ? 'mr-1' : 'ml-1'}`}>{time}</p>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area - Stable sticky block */}
        <div className="mt-auto bg-transparent pb-6 px-8 z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <MessageInput
              ref={inputRef}
              conversationId={activeConversationId}
            />
          </div>
        </div>

        <EscalationModal 
          isOpen={isEscalating}
          onClose={() => setIsEscalating(false)}
          onEscalate={handleEscalateConfirm}
          teamId={conversation.assignedTeam || conversation.userId?.teamId}
          conversationId={activeConversationId}
        />
      </div>

      {/* Right User Sidebar containing the Merge UI */}
      {conversation?.userId && isSidebarOpen && (
        <UserProfileSidebar 
          user={conversation.userId} 
          onProfileUpdated={(updatedUser) => {
            setConversation(prev => ({...prev, userId: updatedUser}));
          }} 
        />
      )}
    </div>
  );
}

