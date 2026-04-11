import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import api from '../../services/apiClient';
import { Paperclip, Smile, Send, X } from 'lucide-react';

// forwardRef lets ChatWindow call sendMessage() and setText() imperatively
const MessageInput = forwardRef(function MessageInput({ conversationId, onMessageSent }, ref) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = async (overrideText) => {
    const content = (overrideText ?? text).trim();
    if ((!content && !attachment) || !conversationId || sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (attachment) formData.append('file', attachment);

      const stored = JSON.parse(sessionStorage.getItem('omni_user') || '{}');
      const token = stored?.token;
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

      const response = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

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
      
      <div className="glass-card !bg-white/80 !backdrop-blur-xl border border-white/60 !rounded-[24px] pl-5 pr-3 py-3 flex items-center shadow-[0px_4px_20px_rgba(0,0,0,0.04),0px_10px_40px_rgba(0,0,0,0.06)] w-full">
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-slate-600 hover:text-teal rounded-full hover:bg-slate-100 transition-colors"
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Type your message here..." 
          className="flex-1 bg-transparent px-4 outline-none text-[14px] font-medium text-slate-800 placeholder-slate-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="p-2.5 text-slate-600 hover:text-teal rounded-full hover:bg-slate-100 transition-colors mr-2">
          <Smile size={20} />
        </button>
        <button 
          onClick={() => handleSend()}
          disabled={(!text.trim() && !attachment) || sending}
          className="bg-teal hover:brightness-95 text-white w-12 h-12 rounded-[18px] flex items-center justify-center transition-all shadow-md shrink-0 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
});

export default MessageInput;
