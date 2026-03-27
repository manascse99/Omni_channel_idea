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
    <div className="bg-white border border-gray-200 rounded-2xl pl-4 pr-2 py-2 flex items-center shadow-lg w-full">
      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
        <Paperclip size={20} />
      </button>
      <input 
        type="text" 
        placeholder="Type your message here..." 
        className="flex-1 bg-transparent px-3 outline-none text-[14px] font-medium text-gray-700 placeholder-gray-400"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors mr-2">
        <Smile size={20} />
      </button>
      <button 
        onClick={() => handleSend()}
        disabled={!text.trim() || sending}
        className="bg-primary hover:bg-[#15335E] text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-md shrink-0 disabled:opacity-50"
      >
        <Send size={18} />
      </button>
    </div>
  );
});

export default MessageInput;
