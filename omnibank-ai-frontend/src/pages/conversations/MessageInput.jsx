import { Paperclip, Smile, Send } from 'lucide-react';

export default function MessageInput() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl pl-4 pr-2 py-2 flex items-center shadow-lg w-full">
      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
        <Paperclip size={20} />
      </button>
      <input 
        type="text" 
        placeholder="Type your message here..." 
        className="flex-1 bg-transparent px-3 outline-none text-[14px] font-medium text-gray-700 placeholder-gray-400"
      />
      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors mr-2">
        <Smile size={20} />
      </button>
      <button className="bg-primary hover:bg-[#15335E] text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-md shrink-0">
        <Send size={18} />
      </button>
    </div>
  );
}
