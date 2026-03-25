import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Globe,
  Radio,
  LifeBuoy
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Conversations', path: '/conversations', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] h-screen bg-primary text-white flex flex-col shrink-0">
      {/* Logo Area */}
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Globe size={20} className="text-primary" fill="currentColor" />
        </div>
        <div>
          <h1 className="font-bold text-[18px] tracking-tight text-white leading-none">FintechPortal</h1>
          <p className="text-[9px] text-teal font-bold tracking-[0.15em] uppercase mt-1">AI-OMNICHANNEL</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-[#15335E] text-white border-l-4 border-l-teal shadow-inner'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
        
        {/* New Broadcast Button */}
        <div className="mt-6 px-1">
          <button className="w-full bg-teal hover:bg-[#00b395] text-primary font-bold py-3 rounded-[12px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal/20">
            <Radio size={18} /> New Broadcast
          </button>
        </div>
      </nav>

      {/* Support and Agent Profile Bottom */}
      <div className="mt-auto">
        <div className="px-5 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white border-t border-white/5">
          <LifeBuoy size={18} />
          <span className="text-sm font-medium">Support</span>
        </div>

        <div className="p-5 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer border-t border-white/5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#15335E] flex items-center justify-center text-sm font-bold overflow-hidden border border-white/10">
              MC
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-primary rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate">Marcus Chen</p>
            <p className="text-[11px] text-gray-400 truncate">Senior Agent</p>
          </div>
          <button className="text-gray-400 hover:text-white p-1">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
