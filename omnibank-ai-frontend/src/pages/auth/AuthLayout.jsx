export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="bg-[#EAEFF5] rounded-[24px] shadow-2xl w-full max-w-[480px] p-10 pb-8 relative overflow-hidden flex flex-col items-center border border-white">
        {children}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-[#D9873E] opacity-90 bg-[#D9873E]/10 px-4 py-1.5 rounded-full mb-3">
          <span className="flex items-center justify-center">⚡</span>
          AI-POWERED AUTHENTICATION
        </div>
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
          Powered by AI Omnichannel Platform<br/>
          &copy; 2024 OmniBank Global Securities
        </p>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">
        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] pb-px">?</div>
        Need help accessing your agent account?
      </div>
    </div>
  );
}
