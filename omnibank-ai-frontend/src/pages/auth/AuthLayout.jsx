export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0d1b35 0%, #1A2B4A 50%, #0f2240 100%)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-teal blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-teal blur-2xl"></div>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#00C9A7 1px, transparent 1px), linear-gradient(90deg, #00C9A7 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        ></div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight leading-none">OMNI</h1>
              <p className="text-teal text-[9px] font-bold tracking-[0.25em] uppercase mt-0.5">AI-OMNICHANNEL</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-black leading-tight mb-4">
            The future of<br/>
            <span className="text-teal">customer engagement</span><br/>
            is here.
          </h2>
          <p className="text-white/50 text-sm font-medium leading-relaxed max-w-sm">
            OMNI unifies every customer touchpoint — WhatsApp, voice, email, and more — powered by real-time AI intelligence.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Active Conversations', val: '12,847' },
              { label: 'AI Resolution Rate', val: '94.2%' },
              { label: 'Avg Response Time', val: '1.8s' },
              { label: 'Channels Active', val: '7' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-teal text-xl font-black">{s.val}</p>
                <p className="text-white/40 text-[11px] font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-[11px] font-medium">© 2025 OMNI AI Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 bg-teal rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">OMNI</h1>
              <p className="text-teal text-[8px] font-bold tracking-[0.2em] uppercase">AI-OMNICHANNEL</p>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
