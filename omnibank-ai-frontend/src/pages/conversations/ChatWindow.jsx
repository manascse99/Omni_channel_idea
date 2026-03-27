import { useState, useEffect, useRef } from 'react';
import api from '../../services/apiClient';
import { io } from 'socket.io-client';
import { CheckCircle2, AlertTriangle, UserPlus, MoreVertical, Send } from 'lucide-react';
import MessageInput from './MessageInput';
import AiSuggestionBox from './AiSuggestionBox';

export default function ChatWindow({ activeConversationId }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeConversationId) return;
    
    setLoading(true);
    // Fetch Conversation & Messages
    api.get(`/conversations/${activeConversationId}`)
      .then(res => {
        setConversation(res.data.conversation);
        setMessages(res.data.messages);
        setLoading(false);
        scrollToBottom();
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch AI Suggestion
    api.get(`/conversations/${activeConversationId}/ai-suggestion`)
      .then(res => setSuggestion(res.data.suggestion))
      .catch(console.error);

    // Setup Socket.io
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
    socket.emit('join_conversation', { conversationId: activeConversationId });

    socket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    });

    return () => {
      socket.emit('leave_conversation', { conversationId: activeConversationId });
      socket.disconnect();
    };
  }, [activeConversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateStatus = (newStatus) => {
    api.post(`/conversations/${activeConversationId}/${newStatus}`)
      .then(() => {
        setConversation(prev => ({...prev, status: newStatus === 'resolve' ? 'resolved' : 'escalated'}));
      })
      .catch(console.error);
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

  const initials = conversation.userId?.name ? conversation.userId.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] relative shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
      {/* Chat Header */}
      <div className="h-[76px] border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-primary flex items-center gap-2">
              {conversation.userId?.name || conversation.userId?.phone || 'Unknown User'}
              <span className={`w-2 h-2 rounded-full shadow-sm border border-white ${conversation.status === 'resolved' ? 'bg-gray-400' : 'bg-green-500'}`}></span>
            </h2>
            <p className="text-[11px] text-gray-500 font-bold mt-0.5">{conversation.userId?.email || conversation.userId?.phone}</p>
          </div>
          <div className="ml-4 bg-[#E2E8F0] text-primary border border-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            Intent: {conversation.intent || 'General'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition-colors">
            <UserPlus size={14} /> Assign
          </button>
          <button onClick={() => updateStatus('escalate')} className="px-4 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-red-600 text-[11px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-red-100">
            <AlertTriangle size={14} /> Escalate
          </button>
          <button onClick={() => updateStatus('resolve')} className="px-4 py-2 bg-teal hover:bg-[#00b395] text-white text-[11px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-teal/20">
            <CheckCircle2 size={14} /> Resolve
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ml-1 border border-transparent hover:border-gray-200">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-48">
          
          <div className="text-center my-4">
             <span className="bg-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Started {new Date(conversation.createdAt).toLocaleDateString()}</span>
          </div>

          {messages.map((msg, index) => {
            const isUser = msg.senderType === 'user';
            const isAI = msg.senderType === 'ai';
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={index} className={`flex items-start gap-4 ${!isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-white shadow-sm ${
                  isUser ? 'bg-[#E5F5EF] text-[#0F7A5E]' : isAI ? 'bg-teal text-white' : 'bg-[#15335E] text-white'
                }`}>
                  {isUser ? initials : isAI ? 'AI' : 'AG'}
                </div>
                <div className={`flex flex-col max-w-[70%] ${!isUser ? 'items-end' : 'items-start'}`}>
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
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 max-w-4xl mx-auto w-full px-8 pointer-events-auto z-20">
        <AiSuggestionBox />
        <MessageInput conversationId={activeConversationId} />
      </div>
    </div>
  );
}
