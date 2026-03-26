import { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Radio,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Menu,
  Globe
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Conversations', path: '/conversations', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || 'OMNI User';
  const displayRole = user?.role || 'Agent';
  const displayAvatar = user?.avatar || displayName.slice(0, 2).toUpperCase();

  return (
    <aside 
      className={`h-screen bg-primary transition-all duration-300 ease-in-out flex flex-col shrink-0 border-r border-white/5 relative z-30 shadow-2xl ${
        isCollapsed ? 'w-[80px]' : 'w-[260px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #1A2B4A 0%, #15233D 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-teal text-primary w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-primary z-50 hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* Logo Area */}
      <div className={`px-6 py-8 flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="relative group">
          <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-teal/30 group-hover:rotate-12 transition-transform duration-300">
            <Globe size={22} className="text-primary" fill="currentColor" />
          </div>
          {isCollapsed && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase tracking-widest">
              OMNI Platform
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <h1 className="font-black text-[22px] tracking-tighter text-white leading-none">OMNI</h1>
            <p className="text-[9px] text-teal font-black tracking-[0.2em] uppercase mt-1 opacity-80">AI-OMNICHANNEL</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 flex flex-col gap-1.5 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 py-3 rounded-2xl transition-all font-medium text-sm group relative ${
                  isCollapsed ? 'px-0 justify-center' : 'px-4'
                } ${
                  isActive
                    ? 'bg-white/10 text-teal shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={20} 
                    className={`shrink-0 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,201,167,0.5)]' : 'group-hover:scale-110'}`} 
                  />
                  {!isCollapsed && (
                    <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-teal rounded-r-full shadow-[0_0_10px_rgba(0,201,167,0.8)]" />
                  )}
                  {isCollapsed && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-primary text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* New Broadcast Button */}
        <div className={`mt-6 transition-all duration-300 ${isCollapsed ? 'px-0 flex justify-center' : 'px-2'}`}>
          <button 
            className={`bg-teal hover:bg-[#00b395] text-primary font-black flex items-center justify-center transition-all shadow-xl shadow-teal/20 group relative overflow-hidden ${
              isCollapsed ? 'w-10 h-10 rounded-xl' : 'w-full py-3.5 rounded-2xl gap-2.5'
            }`}
          >
            <Radio size={isCollapsed ? 20 : 18} className="relative z-10" />
            {!isCollapsed && <span className="text-[13px] relative z-10">New Broadcast</span>}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            {isCollapsed && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-teal text-primary text-[11px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                Quick Broadcast
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Bottom Profile Section */}
      <div className="mt-auto border-t border-white/5 bg-black/10 backdrop-blur-sm">
        {/* Profile Card */}
        <div 
          className={`px-4 py-6 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group relative ${
            isCollapsed ? 'justify-center' : ''
          }`}
          onClick={() => navigate('/profile')}
        >
          <div className="relative shrink-0">
            <div className={`rounded-2xl transition-all duration-300 border-2 overflow-hidden bg-primary shadow-lg ${
              isCollapsed ? 'w-10 h-10 border-teal/20' : 'w-11 h-11 border-teal/40'
            }`}>
              <div className="w-full h-full bg-gradient-to-br from-teal/20 to-primary flex items-center justify-center text-sm font-black text-teal">
                {displayAvatar}
              </div>
            </div>
            <span className={`absolute bottom-0 right-0 rounded-full border-2 border-primary z-10 transition-all duration-300 ${
              isCollapsed ? 'w-3 h-3 bg-green-500' : 'w-3.5 h-3.5 bg-green-500'
            }`} />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <p className="text-[14px] font-black text-white truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-teal/60 font-bold truncate uppercase tracking-widest mt-0.5">{displayRole}</p>
            </div>
          )}
          
          {!isCollapsed && (
            <ChevronRight size={14} className="text-white/20 group-hover:text-teal group-hover:translate-x-1 transition-all" />
          )}

          {isCollapsed && (
            <div className="absolute left-20 bottom-8 bg-primary border border-white/10 rounded-2xl p-4 w-[200px] shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none">
              <p className="text-white font-black text-sm">{displayName}</p>
              <p className="text-teal text-[10px] font-bold uppercase tracking-widest">{displayRole}</p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-white/40 text-[10px] font-bold">View Profile</span>
                <ChevronRight size={12} className="text-teal" />
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center transition-all font-bold text-sm hover:bg-red-500/10 group relative ${
            isCollapsed ? 'justify-center py-5' : 'px-6 py-4 gap-4'
          }`}
        >
          <LogOut size={18} className={`transition-colors ${isCollapsed ? 'text-white/30 group-hover:text-red-400' : 'text-white/40 group-hover:text-red-400'}`} />
          {!isCollapsed && <span className="text-white/40 group-hover:text-red-400">Sign Out</span>}
          {isCollapsed && (
            <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[11px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl pointer-events-none uppercase">
              End Session
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
