import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  User, 
  LogOut, 
  HelpCircle,
  PlusCircle,
  Command
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/apiClient';

const PAGE_TABS = {
  '/dashboard': ['Live', 'Today', 'Weekly'],
  '/conversations': ['All', 'Direct', 'Channels', 'AI-Assisted'],
  '/analytics': ['Overview', 'Channels', 'Agents', 'AI Metrics'],
  '/teams': ['All Teams', 'Agents', 'Supervisors'],
  '/settings': ['AI', 'Channels', 'Security', 'Notifications', 'Branding', 'Integrations'],
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user, logout } = useAuthStore();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const basePath = '/' + location.pathname.split('/')[1];
  const tabs = PAGE_TABS[basePath] || [];
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      const unread = res.data?.notifications?.filter(n => !n.isRead) || [];
      setUnreadCount(unread.length);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Re-fetch periodically or hook into socket if available
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Robust tab matching
  const activeTab = tabs.find(t => 
    t.toLowerCase().replace(' ', '-') === tab?.toLowerCase()
  ) || tabs[0];

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (t) => {
    const tabPath = t.toLowerCase().replace(' ', '-');
    navigate(`${basePath}/${tabPath}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || 'OMNI User';
  const displayRole = user?.role || 'Agent';
  const displayEmail = user?.email || 'user@omni.ai';

  return (
    <header className="h-[76px] bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300">
      {/* Search Bar Group */}
      <div className="flex items-center gap-8 flex-1 max-w-2xl">
        <div className="relative group flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00C9A7] transition-colors z-10">
            <Search size={16} strokeWidth={2.5} />
          </div>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search conversations, agents, or settings..." 
            className="w-full bg-slate-50 border border-slate-200/40 rounded-2xl pl-12 pr-16 py-2.5 text-[13px] font-bold text-[#334155] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg shadow-sm opacity-60 group-focus-within:opacity-100 transition-opacity">
            <Command size={10} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400">K</span>
          </div>
        </div>

        {/* Dynamic Page Tabs (Pill Style) */}
        {tabs.length > 0 && (
          <nav className="flex items-center bg-slate-50 p-1 rounded-[18px] border border-slate-200/30 backdrop-blur-sm">
            {tabs.map((t) => {
              const isActive = activeTab === t;
              return (
                <button
                  key={t}
                  onClick={() => handleTabClick(t)}
                  className={`relative px-5 py-2 rounded-2xl text-[12px] font-extrabold transition-all duration-300 group ${
                    isActive
                      ? 'text-[#1e1b4b]'
                      : 'text-[#334155]/50 hover:text-[#334155]/80'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white shadow-[0_4px_12px_rgba(30,27,75,0.08)] rounded-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-200"></div>
                  )}
                  <span className="relative z-10">{t}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-50/50 rounded-2xl border border-slate-200/30">
          {/* Quick Help */}
          <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#00C9A7] hover:bg-white hover:shadow-sm transition-all focus:outline-none">
            <HelpCircle size={18} strokeWidth={2.2} />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/notifications')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center relative transition-all focus:outline-none ${
              location.pathname === '/notifications' 
                ? 'bg-[#00C9A7] text-white shadow-lg shadow-[#00C9A7]/20 border border-[#00C9A7]/10' 
                : 'text-slate-400 hover:text-[#00C9A7] hover:bg-white hover:shadow-sm'
            }`}
          >
            <Bell size={18} strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                location.pathname === '/notifications' ? 'bg-white border-[#00C9A7]' : 'bg-[#00C9A7] border-white animate-pulse'
              }`} />
            )}
          </button>

          {/* Settings Shortcut */}
          <button 
            onClick={() => navigate('/settings')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all focus:outline-none ${
              location.pathname.startsWith('/settings') 
                ? 'bg-[#1e1b4b] text-white shadow-xl shadow-indigo-100' 
                : 'text-slate-400 hover:text-[#1e1b4b] hover:bg-white hover:shadow-sm'
            }`}
          >
            <Settings size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="w-[1px] h-6 bg-slate-200/60 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-[20px] border transition-all duration-300 focus:outline-none ${
              showProfileDropdown 
                ? 'bg-white border-indigo-200 shadow-xl ring-4 ring-indigo-50/20' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#312e81] flex items-center justify-center text-[#00C9A7] text-[12px] font-black shadow-lg">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="text-left hidden xl:block min-w-[80px]">
              <p className="text-[13px] font-[900] text-[#1e1b4b] leading-none">{displayName}</p>
              <p className="text-[10px] text-[#00C9A7] font-black uppercase tracking-[0.15em] mt-1 opacity-80">{displayRole}</p>
            </div>
            
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180 text-[#1e1b4b]' : ''}`} />
          </button>

          {/* Dropdown Menu - Precious Indigo Glass */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-[115%] w-72 bg-white/95 backdrop-blur-2xl border border-indigo-100 rounded-[32px] shadow-[0_25px_60px_rgba(30,27,75,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50 p-2.5">
              <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-[26px] mb-2 border border-slate-100/60">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e1b4b] flex items-center justify-center text-[#00C9A7] text-sm font-black shadow-xl">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-[900] text-[#1e1b4b] truncate tracking-tight">{displayName}</p>
                    <p className="text-[11px] text-[#334155]/60 font-bold truncate">{displayEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black bg-[#00C9A7]/10 text-[#00C9A7] px-2.5 py-1 rounded-full uppercase tracking-widest border border-[#00C9A7]/10 shadow-sm">PRO Agent</span>
                  <span className="text-[9px] font-black bg-indigo-50 text-[#1e1b4b]/40 px-2.5 py-1 rounded-full uppercase tracking-widest">v1.2.5</span>
                </div>
              </div>

              <div className="px-1 py-1 space-y-1">
                <button 
                  onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all hover:bg-slate-50 group focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#00C9A7] group-hover:bg-white transition-all shadow-sm">
                      <User size={16} />
                    </div>
                    <span className="text-[13px] font-[800] text-[#334155]/70 group-hover:text-[#1e1b4b]">Profile Settings</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
                </button>

                <button 
                  onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all hover:bg-slate-50 group focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-white transition-all shadow-sm">
                      <Settings size={16} />
                    </div>
                    <span className="text-[13px] font-[800] text-[#334155]/70 group-hover:text-[#1e1b4b]">Workspace Preferences</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
                </button>
              </div>

              <div className="h-[1px] bg-slate-100 my-2 mx-4" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-[24px] text-left text-[13px] font-black text-rose-500 hover:bg-rose-50 transition-all group focus:outline-none"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-white transition-all active:scale-95 shadow-rose-100/20 shadow-sm">
                  <LogOut size={16} />
                </div>
                <span>Sign Out Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
