import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/apiClient';
import { CheckCircle2, AlertTriangle, UserPlus, MoreVertical, ArrowLeft } from 'lucide-react';
import MessageInput from './MessageInput';
import { Link } from 'react-router-dom';
import EscalationModal from './EscalationModal';
import useSocketStore from '../../store/socketStore';

export default function ChatWindow({ activeConversationId, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);
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
      <div className="flex-1 flex items-center justify-center bg-[#F4F6F9] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 text-gray-400 font-bold">
        Select a conversation from the list to start messaging.
      </div>
    );
  }

  if (loading || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F6F9] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 text-gray-400 font-bold">
        Loading conversation...
      </div>
    );
  }

  const customerName = conversation.userId?.name || conversation.userId?.email || 'Customer';
  const initials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Find the subject from the first user message if it's an email
  const emailSubject = messages.find(m => m.channel === 'email' && m.senderType === 'user' && m.metadata?.emailSubject)?.metadata?.emailSubject || '';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] relative shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
      {/* Chat Header */}
      <div className="h-[90px] border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white shadow-sm z-30">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-50 transition-all shadow-sm mr-1 shrink-0"
            title="Back to Monitor"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="w-11 h-11 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-black text-xs border-2 border-white shadow-sm shrink-0">
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
          <Link to={`/customers/${activeConversationId}`} className="h-9 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-[11px] uppercase tracking-wider font-black rounded-xl flex items-center gap-2 transition-all shadow-sm group">
            <UserPlus size={14} className="text-gray-400 group-hover:text-teal" /> 
            <span>Profile</span>
          </Link>
          <button onClick={() => updateStatus('escalate')} className="h-9 px-4 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-red-600 text-[11px] uppercase tracking-wider font-black rounded-xl flex items-center gap-2 transition-all border border-red-100">
            <AlertTriangle size={14} /> Escalate
          </button>
          <button onClick={() => updateStatus('resolve')} className="h-9 px-4 bg-teal hover:bg-[#00b395] text-white text-[11px] uppercase tracking-wider font-black rounded-xl flex items-center gap-2 transition-all shadow-md shadow-teal/20">
            <CheckCircle2 size={14} /> Resolve
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-all ml-1 border border-transparent hover:border-gray-100">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          
          <div className="text-center my-4">
             <span className="bg-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Started {new Date(conversation.createdAt).toLocaleDateString()}</span>
          </div>

          {messages.map((msg, index) => {
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

                  <div className={`rounded-[20px] px-5 py-4 text-[14px] shadow-sm leading-relaxed ${
                    isUser ? 'bg-white border border-gray-200 rounded-tl-sm text-gray-800' : 'bg-primary text-white rounded-tr-sm shadow-md'
                  }`}>
                    {msg.content}
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
      <div className="mt-auto bg-white border-t border-gray-100 p-6 z-20">
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
  );
}

