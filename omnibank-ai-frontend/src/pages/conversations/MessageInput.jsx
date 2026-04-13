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
      
      <div className={`p-1 mb-2 inline-flex rounded-xl transition-all ${isInternal ? 'bg-amber-100' : 'bg-slate-100'}`}>
        <button 
          onClick={() => setIsInternal(false)}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isInternal ? 'bg-white text-teal shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Reply to Customer
        </button>
        <button 
          onClick={() => setIsInternal(true)}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isInternal ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Lock size={12} /> Internal Note
        </button>
      </div>

      <div className={`glass-card !backdrop-blur-xl border !rounded-[24px] pl-5 pr-3 py-3 flex items-center shadow-lg w-full transition-all ${
        isInternal ? '!bg-amber-50/90 border-amber-200 ring-2 ring-amber-100' : '!bg-white/80 border-white/60 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]'
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
          className={`p-2.5 rounded-full transition-colors ${isInternal ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-600 hover:text-teal hover:bg-slate-100'}`}
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="text" 
          placeholder={isInternal ? "Write an internal note for teammates..." : "Type your message here..."}
          className="flex-1 bg-transparent px-4 outline-none text-[14px] font-medium text-slate-800 placeholder-slate-400"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={`p-2.5 rounded-full transition-colors mr-2 ${isInternal ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-600 hover:text-teal hover:bg-slate-100'}`}>
          <Smile size={20} />
        </button>
        <button 
          onClick={() => handleSend()}
          disabled={(!text.trim() && !attachment) || sending}
          className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all shadow-md shrink-0 disabled:bg-slate-200 disabled:text-slate-400 ${
            isInternal ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-teal hover:brightness-95 text-white'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
});

export default MessageInput;
