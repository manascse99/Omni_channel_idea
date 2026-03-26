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
import { useAuthStore } from '../../store/authStore';

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

  const basePath = '/' + location.pathname.split('/')[1];
  const tabs = PAGE_TABS[basePath] || [];
  
  // Robust tab matching
  const activeTab = tabs.find(t => 
    t.toLowerCase().replace(' ', '-') === tab?.toLowerCase()
  ) || tabs[0];

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
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="relative group flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search conversations, agents, or settings..." 
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-11 pr-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
            <Command size={12} />
            <span className="text-[10px] font-black">K</span>
          </div>
        </div>

        {/* Dynamic Page Tabs */}
        {tabs.length > 0 && (
          <nav className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 pointer-events-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => handleTabClick(t)}
                className={`px-5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                  activeTab === t
                    ? 'bg-white text-primary shadow-lg shadow-gray-200/50 border border-gray-100'
                    : 'text-gray-400 hover:text-primary hover:bg-white/50'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Help */}
        <button className="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-50 transition-all shadow-sm">
          <HelpCircle size={18} />
        </button>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/notifications')}
          className={`w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center relative transition-all shadow-sm ${
            location.pathname === '/notifications' 
              ? 'bg-teal/10 text-teal border-teal/20' 
              : 'text-gray-400 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Settings Shortcut */}
        <button 
          onClick={() => navigate('/settings')}
          className={`w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center transition-all shadow-sm ${
            location.pathname.startsWith('/settings') 
              ? 'bg-primary text-white border-primary/20 shadow-primary/10' 
              : 'text-gray-400 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Settings size={18} />
        </button>

        <div className="w-[1px] h-8 bg-gray-100 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-teal text-[11px] font-black shadow-inner">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            {!tab && (
              <div className="text-left hidden lg:block mr-1">
                <p className="text-[12px] font-black text-primary leading-none">{displayName}</p>
                <p className="text-[9px] text-teal font-black uppercase tracking-widest mt-0.5">{displayRole}</p>
              </div>
            )}
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-14 w-64 bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 p-2">
              <div className="p-4 bg-gray-50/50 rounded-[22px] mb-2 border border-gray-100/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-teal text-[13px] font-black">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-black text-primary truncate leading-tight">{displayName}</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">{displayEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black bg-teal/10 text-teal px-2 py-0.5 rounded-full uppercase tracking-wider">Premium Plan</span>
                  <span className="text-[9px] font-black bg-primary/5 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Alpha</span>
                </div>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all group"
                >
                  <User size={16} className="text-gray-400 group-hover:text-primary" /> Profile Settings
                </button>
                <button 
                  onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all group"
                >
                  <Settings size={16} className="text-gray-400 group-hover:text-primary" /> Preferences
                </button>
              </div>

              <div className="h-[1px] bg-gray-100 my-2 mx-2" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-[13px] font-bold text-red-400 hover:bg-red-50 transition-all group"
              >
                <LogOut size={16} className="text-red-300 group-hover:text-red-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
