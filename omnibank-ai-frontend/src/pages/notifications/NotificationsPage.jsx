import { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  MessageSquare, 
  UserPlus, 
  AlertCircle, 
  Search, 
  Filter, 
  Settings,
  MoreVertical,
  Trash2,
  Inbox,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/conversations')
      .then(res => {
        const convos = res.data.conversations || [];
        const mapped = convos.map((c) => ({
          id: c._id,
          type: c.status === 'escalated' ? 'critical' : c.status === 'ai-handling' ? 'conversation' : 'team',
          title: c.status === 'escalated' ? 'Escalation Alert' : 'New Conversation',
          desc: `Customer ${c.userId?.name || c.userId?.phone || 'Unknown'} reached out via ${c.lastChannel || 'unknown channel'}. ${c.lastMessage ? '"' + c.lastMessage + '"' : ''}`,
          time: new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: !c.isRead,
          status: c.status,
          icon: c.status === 'escalated' ? AlertCircle : MessageSquare,
          color: c.status === 'escalated' ? 'text-red-500 bg-red-50' : 'text-teal bg-teal/10',
          link: `/conversations/${c._id}`
        }));
        setNotifications(mapped);
      })
      .catch(console.error);
  }, []);

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return n.unread;
    if (activeTab === 'team') return n.type === 'team';
    if (activeTab === 'system') return n.type === 'system' || n.type === 'critical';
    return true;
  });

  const markAllRead = async () => {
    try {
      await api.post('/conversations/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/conversations/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };


  return (
    <div className="h-full flex flex-col bg-gray-50/30 overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-black text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
              <Bell size={22} fill="currentColor" />
            </div>
            Notifications
          </h1>
          <p className="text-[12px] text-gray-400 font-medium mt-1">Manage your platform alerts and activity logs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Check size={14} /> Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Filters */}
        <div className="w-[280px] border-r border-gray-100 bg-white/50 p-6 flex flex-col gap-6 shrink-0">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">View Category</p>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Activity', icon: Inbox, count: notifications.length },
                { id: 'unread', label: 'Unread', icon: Bell, count: notifications.filter(n => n.unread).length },
                { id: 'team', label: 'Team Mentions', icon: UserPlus, count: notifications.filter(n => n.type === 'team').length },
                { id: 'system', label: 'System Alerts', icon: AlertCircle, count: notifications.filter(n => n.type === 'system' || n.type === 'critical').length },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                    activeTab === t.id 
                      ? 'bg-primary text-white shadow-xl shadow-primary/10' 
                      : 'text-gray-500 hover:bg-white hover:text-primary hover:shadow-sm border border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <t.icon size={16} strokeWidth={activeTab === t.id ? 2.5 : 2} />
                    <span className="text-[13px] font-bold">{t.label}</span>
                  </div>
                  {t.count > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      activeTab === t.id ? 'bg-teal/20 text-teal' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto bg-gradient-to-br from-teal/10 to-transparent border border-teal/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-teal mb-2">
              <Settings size={14} strokeWidth={3} />
              <p className="text-[11px] font-black uppercase tracking-widest">Notification Settings</p>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Customize how and when you receive alerts across Desktop and Email.
            </p>
            <button className="mt-4 text-[11px] font-black text-primary underline underline-offset-4 decoration-teal">
              Access Configuration
            </button>
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-8 py-4 bg-white/30 border-b border-gray-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search notifications..."
                className="w-full bg-white border border-gray-100 rounded-xl px-10 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 text-[12px] font-bold text-gray-500 hover:bg-white shadow-sm transition-all">
              <Filter size={14} /> Filter by date
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {filtered.length > 0 ? (
              filtered.map((n) => (
                <div 
                  key={n.id} 
                  className={`group bg-white rounded-3xl p-5 border-2 transition-all hover:shadow-xl hover:shadow-gray-200/50 flex items-start gap-5 ${
                    n.unread ? 'border-teal/30 shadow-lg shadow-teal/5 bg-gradient-to-br from-white to-teal/5' : 'border-gray-50 shadow-sm'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center relative ${n.color}`}>
                    <n.icon size={24} />
                    {n.unread && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal rounded-full border-4 border-white shadow-sm" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-[15px] font-black text-primary truncate leading-tight">{n.title}</h4>
                      <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1 shrink-0">
                        <Clock size={10} /> {n.time}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-4">
                      {n.desc}
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(n.link)}
                        className="px-5 py-2 rounded-xl bg-primary text-white text-[11px] font-black flex items-center gap-2 shadow-lg shadow-primary/10 hover:translate-y-[-1px] transition-all"
                      >
                        View Detail <ExternalLink size={10} />
                      </button>
                      {n.unread && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="px-5 py-2 rounded-xl text-[11px] font-black text-teal hover:bg-teal/5 transition-all"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
                      title="Remove notification"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6 font-black scale-125">
                  <Bell size={40} />
                </div>
                <h3 className="text-[18px] font-black text-primary tracking-tight">All clean!</h3>
                <p className="text-[13px] text-gray-400 font-medium mt-1">No new notifications in this category.</p>
                <button 
                  onClick={() => setActiveTab('all')}
                  className="mt-6 text-teal font-black text-[13px] underline underline-offset-4"
                >
                  View all activity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
