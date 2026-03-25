import { CheckCircle2, AlertTriangle, UserPlus, MoreVertical } from 'lucide-react';
import MessageInput from './MessageInput';
import AiSuggestionBox from './AiSuggestionBox';

export default function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] relative shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
      {/* Chat Header */}
      <div className="h-[76px] border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-bold text-sm">
            RK
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-primary flex items-center gap-2">
              Rajesh Kumar <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm border border-white"></span>
            </h2>
            <p className="text-[11px] text-gray-500 font-bold mt-0.5">+91 98765 43210</p>
          </div>
          <div className="ml-4 bg-[#E2E8F0] text-primary border border-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            Loan Intent: Personal Loan
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition-colors">
            <UserPlus size={14} /> Assign
          </button>
          <button className="px-4 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-red-600 text-[11px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-red-100">
            <AlertTriangle size={14} /> Escalate
          </button>
          <button className="px-4 py-2 bg-teal hover:bg-[#00b395] text-white text-[11px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-teal/20">
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
            <span className="bg-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Today</span>
          </div>

          {/* Customer Message */}
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-bold text-xs shrink-0 border border-green-200">RK</div>
            <div className="flex flex-col items-start max-w-[70%]">
              <div className="bg-white border border-gray-200 rounded-[20px] rounded-tl-sm px-5 py-4 text-[14px] text-gray-800 shadow-sm leading-relaxed">
                I'm looking for a personal loan of ₹5,00,000 for home renovation. What are the best interest rates you can offer for a 3-year tenure?
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold ml-1 tracking-wider uppercase">10:24 AM</p>
            </div>
          </div>

          {/* AI Message */}
          <div className="flex items-start gap-4 flex-row-reverse">
            <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
               <span className="text-white text-[11px] font-bold tracking-wider">AI</span>
            </div>
            <div className="flex flex-col items-end max-w-[70%]">
              <div className="bg-primary text-white rounded-[20px] rounded-tr-sm px-5 py-4 text-[14px] shadow-md leading-relaxed">
                Welcome Rajesh! Our current personal loan rates start at 10.5% p.a. for pre-approved customers. Based on your relationship with OmniBank, you might be eligible for a special rate. Would you like to check your eligibility now?
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold mr-1 tracking-wider uppercase">10:25 AM</p>
            </div>
          </div>

          {/* Customer Message */}
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-bold text-xs shrink-0 border border-green-200">RK</div>
            <div className="flex flex-col items-start max-w-[70%]">
              <div className="bg-white border border-gray-200 rounded-[20px] rounded-tl-sm px-5 py-4 text-[14px] text-gray-800 shadow-sm leading-relaxed">
                Yes, please check. My monthly income is ₹85,000.
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold ml-1 tracking-wider uppercase">10:26 AM</p>
            </div>
          </div>
          
          {/* System Separator */}
          <div className="flex items-center justify-center my-4 gap-4">
             <div className="h-px bg-gray-200 flex-1 max-w-[100px]"></div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Active Queue: Assigned to Marcus Chen</p>
             <div className="h-px bg-gray-200 flex-1 max-w-[100px]"></div>
          </div>

          {/* Agent Message */}
          <div className="flex items-start gap-4 flex-row-reverse">
            <div className="w-9 h-9 rounded-full bg-[#15335E] text-white flex items-center justify-center font-bold text-xs shrink-0 border-2 border-white shadow-sm">MC</div>
            <div className="flex flex-col items-end max-w-[70%]">
              <div className="bg-[#0F7A5E] text-white rounded-[20px] rounded-tr-sm px-5 py-4 text-[14px] shadow-md leading-relaxed">
                Hi Rajesh, I'm taking over from the AI assistant. I've received your income details. Let me quickly verify your account history to give you the exact offer.
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold mr-1 tracking-wider uppercase">10:27 AM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 max-w-4xl mx-auto w-full px-8 pointer-events-auto z-20">
        <AiSuggestionBox />
        <MessageInput />
      </div>
    </div>
  );
}
