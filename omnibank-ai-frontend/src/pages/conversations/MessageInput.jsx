import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import api from '../../services/apiClient';
import useSocketStore from '../../store/socketStore';
import { Paperclip, Smile, Send, X, Lock } from 'lucide-react';

const MessageInput = forwardRef(function MessageInput({ conversationId, onMessageSent, currentAgent }, ref) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isInternal, setIsInternal] = useState(false);
  
  // Mention states
  const [agents, setAgents] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  
  const fileInputRef = useRef(null);
  const { socket } = useSocketStore();

  useEffect(() => {
    // Fetch teammates for @mentions
    api.get('/agents')
      .then(res => setAgents(res.data.agents || []))
      .catch(err => console.error('Failed to fetch agents:', err));
  }, []);

  // Typing indicator logic
  const typingTimeoutRef = useRef(null);
  const handleTextChange = (val) => {
    setText(val);
    
    // Check for mentions
    const lastWord = val.split(' ').pop();
    if (isInternal && lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.substring(1));
    } else {
      setShowMentions(false);
    }

    if (!socket || !conversationId || !currentAgent) return;

    // Emit typing status
    socket.emit('agent_typing', { conversationId, agent: currentAgent, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('agent_typing', { conversationId, agent: currentAgent, isTyping: false });
    }, 2000);
  };

  const handleSelectAgent = (agent) => {
    const words = text.split(' ');
    words.pop(); // Remove the partial @mention
    setText([...words, `@${agent.name}`].join(' ') + ' ');
    setShowMentions(false);
    setIsInternal(true); // Auto-switch to internal if mentioning
  };

  const handleSend = async (overrideText) => {
    const content = (overrideText ?? text).trim();
    if ((!content && !attachment) || !conversationId || sending) return;
    
    // Check if this is a handoff (Starts with @AgentName in an internal note)
    const mentionedAgent = agents.find(a => content.startsWith(`@${a.name}`));
    if (isInternal && mentionedAgent) {
      setSending(true);
      try {
        await api.post(`/conversations/${conversationId}/handoff`, {
          targetAgentId: mentionedAgent._id,
          note: content.split(`@${mentionedAgent.name}`).pop().trim()
        });
        setText('');
        onMessageSent?.();
        return;
      } catch (err) {
        console.error('Handoff failed:', err);
      } finally {
        setSending(false);
      }
    }

    setSending(true);
    try {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (attachment) formData.append('file', attachment);
      formData.append('isInternal', isInternal);
      formData.append('agentId', currentAgent?.id || '');

      if (!response.ok) throw new Error('Failed to send file via fetch');
      setText('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onMessageSent?.();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Expose setText and handleSend to parent via ref
  useImperativeHandle(ref, () => ({
    setText,
    sendMessage: handleSend,
  }));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Mention Dropdown */}
      {showMentions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mention Team Member</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {agents
              .filter(a => a.name.toLowerCase().includes(mentionFilter.toLowerCase()) && a.id !== currentAgent?.id)
              .map(agent => (
                <button
                  key={agent._id}
                  onClick={() => handleSelectAgent(agent)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal/5 transition-colors text-left border-b border-slate-50 last:border-0 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 font-black text-[10px]">
                    {agent.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800 group-hover:text-teal-700">{agent.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{agent.role}</p>
                  </div>
                </button>
              ))}
            {agents.filter(a => a.name.toLowerCase().includes(mentionFilter.toLowerCase()) && a.id !== currentAgent?.id).length === 0 && (
              <div className="p-4 text-center text-slate-400 text-[11px] font-bold">No agents found</div>
            )}
          </div>
        </div>
      )}

      {attachment && (
        <div className="absolute -top-12 left-5 bg-white border border-gray-200 shadow-md rounded-xl px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-6 h-6 rounded bg-teal/10 flex items-center justify-center">
            <Paperclip size={12} className="text-teal" />
          </div>
          <span className="text-[13px] font-bold text-gray-700 truncate max-w-[200px]">{attachment.name}</span>
          <button 
            onClick={() => {
              setAttachment(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }} 
            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className={`p-1.5 mb-3 inline-flex rounded-2xl transition-all shadow-sm ${isInternal ? 'bg-amber-100/60 border border-amber-200/50' : 'bg-slate-50 border border-slate-200/40'}`}>
        <button 
          onClick={() => setIsInternal(false)}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            !isInternal ? 'bg-white text-[#00C9A7] shadow-md border border-indigo-50' : 'text-[#334155]/40 hover:text-[#334155]/60'
          }`}
        >
          Reply to Customer
        </button>
        <button 
          onClick={() => setIsInternal(true)}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            isInternal ? 'bg-amber-500 text-white shadow-md' : 'text-[#334155]/40 hover:text-[#334155]/60'
          }`}
        >
          <Lock size={12} strokeWidth={3} /> Internal Note
        </button>
      </div>

      <div className={`glass-card !backdrop-blur-3xl border !rounded-[28px] pl-6 pr-3.5 py-3.5 flex items-center shadow-xl w-full transition-all duration-300 ${
        isInternal 
          ? '!bg-amber-50/90 border-amber-200 ring-4 ring-amber-100/20' 
          : '!bg-white/90 border-slate-200 shadow-[0_15px_40px_rgba(30,27,75,0.04)] focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50/50'
      }`}>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`p-2.5 rounded-2xl transition-all ${
            isInternal ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-400 hover:text-[#1e1b4b] hover:bg-slate-50'
          }`}
        >
          <Paperclip size={20} strokeWidth={2.5} />
        </button>
        <input 
          type="text" 
          placeholder={isInternal ? "Write an internal note for teammates..." : "Type your message here..."}
          className={`flex-1 bg-transparent px-5 outline-none text-[14.5px] font-bold text-[#334155] placeholder-[${isInternal ? '#92400e/40' : '#334155/30'}]`}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={`p-2.5 rounded-2xl transition-all mr-2 ${
          isInternal ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-400 hover:text-[#1e1b4b] hover:bg-slate-50'
        }`}>
          <Smile size={20} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => handleSend()}
          disabled={(!text.trim() && !attachment) || sending}
          className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all shadow-xl shrink-0 active:scale-95 disabled:grayscale disabled:opacity-30 disabled:pointer-events-none ${
            isInternal ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-gradient-to-br from-[#00C9A7] to-[#00A884] text-white shadow-teal-100/50 hover:shadow-teal-100/80'
          }`}
        >
          <Send size={20} strokeWidth={3} className={sending ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
});

export default MessageInput;
