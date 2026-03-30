import { useState, forwardRef, useImperativeHandle } from 'react';
import api from '../../services/apiClient';
import { Paperclip, Smile, Send } from 'lucide-react';

// forwardRef lets ChatWindow call sendMessage() and setText() imperatively
const MessageInput = forwardRef(function MessageInput({ conversationId, onMessageSent }, ref) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (overrideText) => {
    const content = (overrideText ?? text).trim();
    if (!content || !conversationId || sending) return;
    setSending(true);
    try {
      await api.post(`/conversations/${conversationId}/messages`, { content });
      setText('');
      onMessageSent?.();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
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
    <div className="glass-card !bg-white/80 !backdrop-blur-xl border border-white/60 !rounded-[24px] pl-5 pr-3 py-3 flex items-center shadow-[0px_4px_20px_rgba(0,0,0,0.04),0px_10px_40px_rgba(0,0,0,0.06)] w-full">
      <button className="p-2.5 text-slate-400 hover:text-[#00C9A7] rounded-full hover:bg-slate-100/50 transition-colors">
        <Paperclip size={20} />
      </button>
      <input 
        type="text" 
        placeholder="Type your message here..." 
        className="flex-1 bg-transparent px-4 outline-none text-[14px] font-medium text-slate-700 placeholder-slate-400"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="p-2.5 text-slate-400 hover:text-[#00C9A7] rounded-full hover:bg-slate-100/50 transition-colors mr-2">
        <Smile size={20} />
      </button>
      <button 
        onClick={() => handleSend()}
        disabled={!text.trim() || sending}
        className="bg-gradient-to-r from-[#00C9A7] to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white w-12 h-12 rounded-[18px] flex items-center justify-center transition-all shadow-md shrink-0 disabled:opacity-50 disabled:grayscale"
      >
        <Send size={18} />
      </button>
    </div>
  );
});

export default MessageInput;
