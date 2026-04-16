import { useState, useEffect } from 'react';
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
  Globe,
  Bell
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import useAuthStore from '../../store/authStore';
import useSocketStore from '../../store/socketStore';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, connect } = useSocketStore();

  const fetchUnreadCount = () => {
    api.get('/notifications')
      .then(res => {
        const unread = (res.data?.notifications || []).filter(n => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(err => {
        console.error('Sidebar notification fetch error:', err);
        setUnreadCount(0); // Safe fallback
      });
  };

  useEffect(() => {
    connect(); // Initialize singleton socket
    fetchUnreadCount();
  }, [connect]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for new notifications via shared socket
    socket.on('new_notification', fetchUnreadCount);
    socket.on('notification_updated', fetchUnreadCount);

    return () => {
      socket.off('new_notification', fetchUnreadCount);
      socket.off('notification_updated', fetchUnreadCount);
    };
  }, [socket]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Conversations', path: '/conversations', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAvatarStyles = (name) => {
    const gradients = [
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-indigo-500',
      'from-fuchsia-400 to-purple-500',
      'from-rose-400 to-pink-500',
      'from-orange-400 to-red-500'
    ];
    const charCodeSum = (name || 'U').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  const displayName = user?.name || 'OMNI User';
  const displayRole = user?.role || 'Agent';
  const displayAvatar = user?.avatar || displayName.slice(0, 2).toUpperCase();

  const avatarGradient = getAvatarStyles(displayName);

  return (
    <aside 
      className={`h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shrink-0 border-r border-slate-200/60 relative z-40 bg-white/80 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
        isCollapsed ? 'w-[88px]' : 'w-[280px]'
      }`}
    >
      {/* Premium Ambient Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00C9A7]/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Collapse Toggle Button - Refined Premium Action */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-[64px] bg-[#00C9A7] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,201,167,0.3)] border-2 border-white z-[60] hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />}
      </button>

      {/* Logo Area - Precious Indigo Branding */}
      <div className={`px-7 py-10 flex items-center gap-4 transition-all duration-500 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-11 h-11 bg-gradient-to-br from-[#00C9A7] to-[#1e1b4b] rounded-[18px] flex items-center justify-center shrink-0 shadow-[0_8px_25px_rgba(30,27,75,0.2)] group-hover:shadow-[0_8px_30px_rgba(0,201,167,0.4)] group-hover:rotate-[10deg] transition-all duration-500 overflow-hidden relative">
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Globe size={24} className="text-white relative z-10" fill="currentColor" />
          </div>
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="font-[900] text-[24px] tracking-[-0.04em] text-[#1e1b4b] leading-none flex items-center gap-1">
              OMNI
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] shadow-[0_0_12px_#00c9a7]" />
            </h1>
            <p className="text-[10px] text-[#334155]/60 font-black tracking-[0.3em] uppercase mt-1.5 flex items-center gap-2">
              PLATFORM
              <div className="h-[1px] w-5 bg-indigo-100" />
            </p>
          </div>
        )}
      </div>

      {/* Navigation - Luminous Glass Capsules with Indigo Contrast */}
      <nav className="flex-1 px-4 pt-2 flex flex-col gap-2 overflow-y-auto scrollbar-hide py-4 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-[14px] group relative overflow-hidden ${
                  isCollapsed ? 'px-0 justify-center' : 'px-5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00C9A7] to-[#00A884] text-white shadow-[0_12px_24px_rgba(0,201,167,0.3)] z-10'
                    : 'text-[#334155]/60 hover:text-[#1e1b4b] hover:bg-white hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={20} 
                    className={`shrink-0 transition-all duration-500 ${isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'group-hover:scale-110 group-hover:text-[#1e1b4b]'}`} 
                  />
                  {!isCollapsed && (
                    <span className="animate-in fade-in slide-in-from-left-3 duration-500 tracking-tight">{item.name}</span>
                  )}
                  
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className={`absolute ${isCollapsed ? 'top-2 right-2' : 'right-5'} ${isActive ? 'bg-white text-[#00C9A7]' : 'bg-[#00C9A7] text-white'} text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg z-20 transition-colors`}>
                      {unreadCount}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_12px_rgba(255,255,255,1)] z-20" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Strategic Separator */}
        <div className="my-6 px-4">
           <div className="h-[1px] w-full bg-slate-100" />
        </div>

        {/* Quick Broadcast Button - Precious Indigo Gradient */}
        <div className={`transition-all duration-500 ${isCollapsed ? 'px-0 flex justify-center' : 'px-2'}`}>
          <button 
            onClick={() => navigate('/broadcast')}
            className={`group relative flex items-center justify-center transition-all duration-500 overflow-hidden ${
              isCollapsed 
                ? 'w-12 h-12 rounded-[20px] bg-indigo-950 text-white shadow-lg shadow-indigo-200' 
                : 'w-full py-4 rounded-[22px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white font-black gap-3 shadow-[0_12px_30px_rgba(30,27,75,0.2)] hover:shadow-[0_12px_30px_rgba(0,201,167,0.3)] hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Radio size={isCollapsed ? 22 : 20} className={`relative z-10 transition-transform group-hover:scale-110 ${!isCollapsed ? 'text-[#00C9A7]' : ''}`} />
            {!isCollapsed && <span className="text-[14px] relative z-10 tracking-tight">New Broadcast</span>}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </nav>

      {/* Bottom Profile Section - Indigo Accented Card */}
      <div className="p-4 mt-auto">
        <div 
          className={`bg-slate-50 border border-slate-200/50 rounded-[28px] transition-all duration-500 cursor-pointer overflow-hidden p-3 group hover:bg-white hover:border-indigo-100 hover:shadow-[0_12px_30px_rgba(30,27,75,0.06)] relative ${
            isCollapsed ? 'items-center flex-col' : 'items-center flex'
          }`}
          onClick={() => navigate('/profile')}
        >
          <div className="relative shrink-0">
            <div className={`rounded-[20px] transition-all duration-500 border-2 border-white overflow-hidden bg-white shadow-sm ${
              isCollapsed ? 'w-12 h-12' : 'w-11 h-11'
            }`}>
              <div className={`w-full h-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-sm font-black text-white px-2`}>
                {displayAvatar}
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm z-10" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 ml-3.5 animate-in fade-in slide-in-from-left-2 duration-500">
              <p className="text-[15px] font-[900] text-[#1e1b4b] truncate tracking-tight">{displayName}</p>
              <p className="text-[10px] text-[#00C9A7] font-black truncate uppercase tracking-[0.2em] mt-0.5">{displayRole}</p>
            </div>
          )}
          
          {!isCollapsed && (
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mr-1" />
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className={`w-full mt-3 flex items-center transition-all duration-300 font-bold text-[14px] hover:bg-rose-50 rounded-2xl group ${
            isCollapsed ? 'justify-center py-4' : 'px-5 py-3.5 gap-4'
          }`}
        >
          <LogOut size={18} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
          {!isCollapsed && <span className="text-[#334155]/60 group-hover:text-rose-500 tracking-tight">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
