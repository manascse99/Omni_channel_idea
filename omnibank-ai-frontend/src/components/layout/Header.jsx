import { Search, Bell, Settings, Headphones } from 'lucide-react';

export default function Header() {
  const tabs = ['Direct', 'Channels', 'AI-Assisted'];

  return (
    <header className="h-[80px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      
      {/* Dynamic Context Header (Mapped to Figma) */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100/80 border border-gray-200 rounded-[12px] px-4 py-2.5 w-[280px]">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search agents or teams..." 
            className="bg-transparent border-none outline-none text-[13px] font-medium w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Middle Tabs */}
      <div className="flex items-center gap-8 ml-auto">
        {tabs.map((tab, idx) => (
          <button 
            key={tab} 
            className={`text-[12px] font-bold pb-2 pt-1 border-b-[3px] tracking-wide transition-colors ${
              idx === 2 
                ? 'text-teal border-teal' 
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5 border-l border-gray-200 pl-6 ml-6">
        <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full translate-x-1/4 -translate-y-1/4"></span>
        </button>
        <button className="text-gray-500 hover:text-gray-800 transition-colors">
          <Settings size={20} />
        </button>
        <button className="text-gray-500 hover:text-gray-800 transition-colors">
           <Headphones size={20} />
        </button>
        
        {/* Profile Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-teal overflow-hidden shadow-sm ml-2">
          <img src="https://ui-avatars.com/api/?name=Marcus+Chen&background=1A2B4A&color=fff" alt="Agent" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
