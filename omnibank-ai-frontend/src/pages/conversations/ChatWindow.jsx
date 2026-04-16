import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/apiClient';
import { CheckCircle2, AlertTriangle, MoreVertical, ArrowLeft, Link2, ShieldCheck, Paperclip, Zap, ExternalLink, Lock, Mail, MessageSquare, Send, Hash, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MessageInput from './MessageInput';
import EscalationModal from './EscalationModal';
import useSocketStore from '../../store/socketStore';
import useAuthStore from '../../store/authStore';
import UserProfileSidebar from './UserProfileSidebar';

export default function ChatWindow({ activeConversationId, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Collaboration States
  const [typingAgents, setTypingAgents] = useState({}); // {agentId: agentName}
  const [activeAgents, setActiveAgents] = useState({}); // {agentId: agentName}
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { socket, joinRoom, leaveRoom } = useSocketStore();
  const currentAgent = useAuthStore(state => state.user);

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
    if (!activeConversationId || !socket || !currentAgent) return;
    
    // Pass agent info for presence/collision detection
    joinRoom(activeConversationId, { id: currentAgent.id, name: currentAgent.name });

    const handleNewMessage = (data) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    const handleConversationUpdated = (data) => {
      if (data.conversationId === activeConversationId) {
        setConversation(prev => ({
          ...prev,
          status: data.status,
          sentiment: data.sentiment,
          intent: data.intent,
          aiSummary: data.aiSummary,
          suggestedReplies: data.suggestedReplies
        }));
      }
    };

    const handleAgentPresence = (data) => {
      if (data.conversationId === activeConversationId && data.agent.id !== currentAgent.id) {
        setActiveAgents(prev => {
          const next = { ...prev };
          if (data.type === 'join') next[data.agent.id] = data.agent.name;
          else delete next[data.agent.id];
          return next;
        });
      }
    };

    const handleAgentTyping = (data) => {
      if (data.conversationId === activeConversationId && data.agent.id !== currentAgent.id) {
        setTypingAgents(prev => {
          const next = { ...prev };
          if (data.isTyping) next[data.agent.id] = data.agent.name;
          else delete next[data.agent.id];
          return next;
        });
      }
    };

    const handleHandoff = (data) => {
      if (data.conversationId === activeConversationId) {
        setConversation(prev => ({ ...prev, assignedTo: data.targetAgent }));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('agent_presence', handleAgentPresence);
    socket.on('agent_typing', handleAgentTyping);
    socket.on('handoff_occurred', handleHandoff);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('agent_presence', handleAgentPresence);
      socket.off('agent_typing', handleAgentTyping);
      socket.off('handoff_occurred', handleHandoff);
      leaveRoom(activeConversationId, { id: currentAgent.id, name: currentAgent.name });
    };
  }, [activeConversationId, socket, currentAgent, joinRoom, leaveRoom, scrollToBottom]);

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

  const customerName = conversation?.userId?.name || conversation?.userId?.email || 'Customer';
  const initials = customerName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';

  // Find the subject from the first user message if it's an email
  const emailSubject = messages.find(m => m.channel === 'email' && m.senderType === 'user' && m.metadata?.emailSubject)?.metadata?.emailSubject || '';

  const getAvatarStyles = (name) => {
    const gradients = [
      'from-rose-500 to-pink-600',
      'from-fuchsia-500 to-purple-600',
      'from-indigo-500 to-blue-600',
      'from-sky-500 to-cyan-600',
      'from-teal-500 to-emerald-600',
      'from-lime-500 to-green-600',
      'from-yellow-500 to-orange-600',
      'from-orange-500 to-red-600'
    ];
    const initials = (name || 'C').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'C';
    const charCodeSum = (name || 'C').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return { initials, gradient: gradients[charCodeSum % gradients.length] };
  };

  const avatar = getAvatarStyles(customerName);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] overflow-hidden relative min-w-[400px]">
        {/* Chat Header */}
        <div className="h-[96px] border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 bg-white/85 backdrop-blur-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] z-30 relative">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            {/* Back Button */}
            <button 
              onClick={onBack}
              className="w-11 h-11 rounded-2xl border border-slate-200/60 bg-white flex items-center justify-center text-slate-400 hover:text-[#1e1b4b] hover:bg-white hover:border-[#1e1b4b] hover:shadow-xl transition-all mr-1 shrink-0 group"
              title="Back to Monitor"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Premium Avatar */}
            <div className={`w-14 h-14 rounded-[22px] bg-gradient-to-br ${avatar.gradient} text-white flex items-center justify-center font-[900] text-xl border-2 border-white shadow-lg shrink-0 transition-transform hover:scale-110 duration-500`}>
              {avatar.initials}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-[17px] font-[900] text-[#1e1b4b] truncate tracking-tight">
                  {customerName}
                </h2>
                <button 
                  onClick={() => navigate(`/customers/${activeConversationId}`)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#00C9A7] hover:bg-[#00C9A7]/5 transition-all outline-none"
                  title="View Full Profile"
                >
                  <ExternalLink size={16} />
                </button>
                <div className="flex items-center gap-2 leading-none">
                  {/* Channel Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                    conversation.lastChannel === 'email' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                    conversation.lastChannel === 'telegram' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    conversation.lastChannel === 'discord' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    'bg-[#00C9A7]/5 text-[#00C9A7] border-[#00C9A7]/20 shadow-none'
                  }`}>
                    {conversation.lastChannel === 'email' ? <Mail size={12} strokeWidth={2.5} /> :
                     conversation.lastChannel === 'telegram' ? <Send size={12} strokeWidth={2.5} /> :
                     conversation.lastChannel === 'discord' ? <Hash size={12} strokeWidth={2.5} /> :
                     <MessageSquare size={12} strokeWidth={2.5} />}
                    <span>{conversation.lastChannel === 'email' ? 'Email' : conversation.lastChannel}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                    conversation.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    conversation.status === 'escalated' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                         conversation.status === 'resolved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                         conversation.status === 'escalated' ? 'bg-rose-500' :
                         'bg-amber-500 animate-pulse'
                      }`} />
                      {conversation.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[12px] text-[#334155]/60 font-black truncate tracking-tight uppercase tracking-[0.1em]">
                  {conversation.userId?.email || conversation.userId?.phone}
                </p>
                {emailSubject && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                    <p className="text-[12px] text-[#1e1b4b] font-bold truncate max-w-md tracking-tight">
                      {emailSubject}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 ml-6">
            <button 
              onClick={() => updateStatus('escalate')} 
              className="h-11 px-6 bg-[#1e1b4b] text-white text-[11px] uppercase font-black tracking-widest rounded-2xl flex items-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(30,27,75,0.15)] border border-white/10 hover:shadow-[0_8px_25px_rgba(225,29,72,0.2)] hover:bg-rose-600 active:scale-95 group"
            >
              <AlertTriangle size={18} className="group-hover:rotate-12 transition-transform" /> 
              <span>Escalate</span>
            </button>
            <button 
              onClick={() => updateStatus('resolve')} 
              className="h-11 px-6 bg-gradient-to-br from-[#00C9A7] to-[#00A884] text-white text-[11px] uppercase font-black tracking-widest rounded-2xl flex items-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(0,201,167,0.2)] hover:shadow-[0_8px_25px_rgba(0,201,167,0.4)] active:scale-95 group"
            >
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /> 
              <span>Resolve</span>
            </button>
            
            <div className="w-[1px] h-8 bg-slate-200/60 mx-1" />
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all border ${
                isSidebarOpen 
                  ? 'bg-[#1e1b4b] border-[#1e1b4b] text-[#00C9A7] shadow-xl' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-[#1e1b4b] hover:border-[#1e1b4b] hover:shadow-lg'
              }`}
              title="Toggle User Profile"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide bg-[#f4f7fb] z-10">
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            <div className="text-center my-6">
               <span className="bg-slate-200/60 text-[#334155]/40 text-[9px] uppercase font-black tracking-[0.2em] px-3.5 py-1.5 rounded-full border border-white/50">Started {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today'}</span>
            </div>

            {/* Collision Detection Banner */}
            {Object.keys(activeAgents).length > 0 && (
              <div className="bg-[#1e1b4b] border border-white/5 rounded-[28px] p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] shadow-inner">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#00C9A7] uppercase tracking-widest leading-none mb-1">Collision Shield Active</p>
                    <p className="text-[13px] font-bold text-white/90">
                      {Object.values(activeAgents).join(', ')} {Object.keys(activeAgents).length === 1 ? 'is' : 'are'} also viewing this chat.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#00C9A7] text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(0,201,167,0.3)]">Read Only Recommended</span>
              </div>
            )}

            {[...messages].map((msg, index) => {
              const isUser = msg.senderType === 'user';
              const isInternal = msg.isInternal;
              const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

              return (
                <div key={index} className={`flex items-start gap-4 ${!isUser ? 'flex-row-reverse' : ''} ${isInternal ? 'opacity-90' : ''}`}>
                  <div className={`w-10 h-10 rounded-[18px] flex items-center justify-center font-black text-xs shrink-0 border-2 border-white shadow-md transition-all duration-300 ${
                    isUser ? 'bg-slate-100 text-[#1e1b4b] active:scale-95' : isInternal ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-[#1e1b4b] text-[#00C9A7] shadow-indigo-900/20'
                  }`}>
                    {isUser ? initials : isInternal ? <Lock size={14} /> : (msg.metadata?.agentId?.name?.[0]?.toUpperCase() || 'AG')}
                  </div>
                  <div className={`flex flex-col max-w-[75%] ${!isUser ? 'items-end' : 'items-start'}`}>
                    {/* Channel Badge & Agent Name */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      {isInternal && (
                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Lock size={10} />
                          Internal Note
                        </span>
                      )}
                      {!isUser && msg.metadata?.agentId?.name && (
                        <span className="text-[9px] font-black text-[#1e1b4b]/50 uppercase tracking-widest">
                          Agent: {msg.metadata.agentId.name}
                        </span>
                      )}
                      {!isInternal && (
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                          msg.channel === 'email' ? 'text-blue-700 bg-blue-50 border-blue-200' : 
                          msg.channel === 'whatsapp' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                          msg.channel === 'telegram' ? 'text-sky-700 bg-sky-50 border-sky-200' :
                          msg.channel === 'discord' ? 'text-indigo-700 bg-indigo-50 border-indigo-200' :
                          'text-purple-700 bg-purple-50 border-purple-200'
                        }`}>
                          via {msg.channel === 'email' ? 'Email' : msg.channel === 'telegram' ? 'Telegram' : msg.channel === 'discord' ? 'Discord' : 'Web Chat'}
                        </span>
                      )}
                    </div>

                    <div className={`rounded-[28px] px-7 py-5 text-[14.5px] shadow-lg leading-relaxed ${
                      isUser ? 'bg-white border border-slate-100 rounded-tl-[6px] text-[#1e1b4b] font-semibold' : 
                      isInternal ? 'bg-amber-50 border border-amber-200 rounded-tr-[6px] text-amber-900 italic font-medium' :
                      'bg-[#1e1b4b] text-white rounded-tr-[6px] border border-white/5 font-semibold shadow-indigo-100'
                    }`}>
                      {msg.metadata?.attachmentUrl && (
                        <div className="mb-4 mt-1">
                          {msg.metadata.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <div className="rounded-[20px] overflow-hidden shadow-xl border-4 border-white inline-block bg-white/5 p-0.5 group cursor-pointer">
                              <img 
                                src={`http://localhost:5001${msg.metadata.attachmentUrl}`} 
                                alt="Attachment" 
                                className="max-w-[280px] max-h-[280px] rounded-[18px] object-contain transition-transform group-hover:scale-[1.02] duration-500" 
                              />
                            </div>
                          ) : (
                            <a 
                              href={`http://localhost:5001${msg.metadata.attachmentUrl}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all inline-flex max-w-[280px] ${
                                isUser ? 'bg-slate-50 border-slate-200 hover:bg-white hover:border-[#00C9A7]/40' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isUser ? 'bg-white shadow-sm text-slate-400' : 'bg-[#1e1b4b]/20 text-[#00C9A7]'}`}>
                                <Paperclip size={16} className="shrink-0" />
                              </div>
                              <span className="font-[900] underline underline-offset-4 truncate text-[11px] uppercase tracking-widest">{msg.metadata.fileName || 'View Attachment'}</span>
                            </a>
                          )}
                        </div>
                      )}
                      <div>{msg.content}</div>
                    </div>
                    <p className={`text-[9px] text-gray-400 mt-2.5 font-black tracking-widest uppercase ${!isUser ? 'mr-3' : 'ml-3'}`}>{time}</p>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} className="h-6" />
            
            {/* Typing Indicators */}
            {Object.keys(typingAgents).length > 0 && (
              <div className="flex items-center gap-3 text-[#334155]/30 text-[9px] font-black uppercase tracking-[0.2em] px-3 animate-in fade-in slide-in-from-left-4">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-[#00C9A7] rounded-full animate-bounce shadow-[0_0_8px_rgba(0,201,167,0.5)]" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                {Object.values(typingAgents).join(', ')} {Object.keys(typingAgents).length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
          </div>
        </div>

        {/* Strategic AI Suggestions */}
        {conversation.status === 'ai-processing' && (
          <div className="px-8 mb-6 border-l-[6px] border-[#00C9A7] bg-white/60 backdrop-blur-xl py-3 animate-pulse shadow-sm rounded-r-2xl mx-8">
            <div className="flex items-center gap-3 text-[#1e1b4b] text-[10px] font-black uppercase tracking-[0.1em]">
               <div className="w-6 h-6 rounded-lg bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7]">
                  <Zap size={14} className="fill-current" />
               </div>
              OmniBank AI is drafting a strategic response...
            </div>
          </div>
        )}

        {conversation.suggestedReplies?.length > 0 && (
          <div className="px-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex items-center gap-2 mb-3 text-[#1e1b4b]/40 text-[9px] font-black uppercase tracking-[0.2em] ml-2">
              <Zap size={12} className="text-[#00C9A7] fill-current" />
              Strategic Suggestions
            </div>
            <div className="flex flex-wrap gap-2.5 ml-2">
              {conversation.suggestedReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => inputRef.current?.setText(reply)}
                  className="bg-white border border-indigo-100 text-[#1e1b4b] px-5 py-3 rounded-2xl text-[12px] font-black tracking-tight shadow-lg shadow-indigo-100/20 hover:bg-[#1e1b4b] hover:text-white hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Stable sticky block */}
        <div className="mt-auto bg-transparent pb-8 px-8 z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <MessageInput
              ref={inputRef}
              conversationId={activeConversationId}
              currentAgent={currentAgent ? { id: currentAgent.id, name: currentAgent.name } : null}
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

