import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Briefcase, Shield, Camera,
  Save, LogOut, Bell, Globe, Lock, ChevronRight, Edit3,
  Star, Bot, MessageSquare
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'OMNI User',
    email: user?.email || 'user@omni.ai',
    phone: user?.phone || '+91 00000 00000',
    role: user?.role || 'Agent',
    department: user?.department || 'Customer Experience',
    bio: user?.bio || 'Senior agent handling multi-channel customer queries.',
    location: user?.location || 'Mumbai, India',
    timezone: user?.timezone || 'IST (UTC+5:30)',
  });

  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, sms: false, push: true, weekly: true });

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const stats = [
    { label: 'Conversations', val: '1,284' },
    { label: 'CSAT Score', val: '96.2%' },
    { label: 'Avg Handle Time', val: '2m 14s' },
    { label: 'AI Assists', val: '342' },
  ];

  const InputRow = ({ label, icon: Icon, field, type = 'text' }) => (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
      <div className={`flex items-center gap-3 border rounded-xl px-4 h-12 transition-all ${editing ? 'bg-white border-gray-200 focus-within:border-teal/60' : 'bg-gray-50 border-transparent'}`}>
        <Icon size={15} className="text-gray-400 shrink-0" />
        <input
          type={type}
          className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-primary disabled:text-gray-500"
          value={form[field]}
          disabled={!editing}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-[28px] font-black text-primary tracking-tight">My Profile</h2>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5">Manage your personal info & preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 text-[13px] font-bold">
              ✓ Saved successfully
            </div>
          )}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="text-[13px] font-bold text-gray-400 hover:text-primary transition-colors px-4 py-2">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-teal hover:bg-[#00b395] text-primary font-black px-5 py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-teal/20">
                <Save size={15} /> Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-primary/20">
              <Edit3 size={15} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Avatar Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-[#2A3F6A] flex items-center justify-center text-3xl font-black text-teal border-4 border-white shadow-xl">
                {initials}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-teal rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#00b395] transition-colors">
                <Camera size={13} className="text-primary" />
              </div>
            </div>
            <h3 className="text-[16px] font-black text-primary text-center">{form.name}</h3>
            <p className="text-[12px] text-gray-400 font-medium text-center mt-0.5">{form.role}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold text-green-600">Online · Available</span>
            </div>

            {/* Stats */}
            <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-gray-100">
              {stats.map(s => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                  <p className="text-[15px] font-black text-primary">{s.val}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 transition-all text-[13px] font-bold"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-[13px] font-black text-primary mb-4 flex items-center gap-2">
              <Shield size={15} className="text-teal" /> Achievements
            </h4>
            {[
              { icon: Star, label: 'Top Performer Q1 2025', clr: 'text-amber-600 bg-amber-50' },
              { icon: Bot, label: 'AI Champion', clr: 'text-indigo-600 bg-indigo-50' },
              { icon: MessageSquare, label: '1000+ Conversations', clr: 'text-teal bg-teal/10' },
            ].map((b, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 ${b.clr}`}>
                <b.icon size={16} />
                <span className="text-[12px] font-bold">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
            <h4 className="text-[15px] font-black text-primary mb-6 flex items-center gap-2">
              <User size={17} className="text-teal" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputRow label="Full Name" icon={User} field="name" />
              <InputRow label="Work Email" icon={Mail} field="email" type="email" />
              <InputRow label="Mobile" icon={Phone} field="phone" />
              <InputRow label="Role / Title" icon={Briefcase} field="role" />
              <InputRow label="Department" icon={Globe} field="department" />
              <InputRow label="Location" icon={Globe} field="location" />
            </div>
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bio</label>
              <textarea
                rows={2}
                disabled={!editing}
                className={`w-full border rounded-xl px-4 py-3 text-[14px] font-medium text-primary outline-none resize-none transition-all ${editing ? 'bg-white border-gray-200 focus:border-teal/60' : 'bg-gray-50 border-transparent text-gray-500'}`}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
            <h4 className="text-[15px] font-black text-primary mb-6 flex items-center gap-2">
              <Bell size={17} className="text-teal" /> Notification Preferences
            </h4>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive conversation summaries via email' },
                { key: 'sms', label: 'SMS Alerts', desc: 'Critical alerts sent to your mobile' },
                { key: 'push', label: 'Push Notifications', desc: 'Real-time browser alerts for new messages' },
                { key: 'weekly', label: 'Weekly Report', desc: 'Automated performance report every Monday' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-[13px] font-bold text-primary">{label}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${notifs[key] ? 'bg-teal' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${notifs[key] ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
            <h4 className="text-[15px] font-black text-primary mb-6 flex items-center gap-2">
              <Lock size={17} className="text-teal" /> Security
            </h4>
            {[
              { label: 'Change Password', desc: 'Update your account password' },
              { label: 'Two-Factor Authentication', desc: '2FA via authenticator app — Enabled' },
              { label: 'Active Sessions', desc: '1 active session • Mumbai, India' },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-3 px-3 rounded-xl transition-colors group">
                <div className="text-left">
                  <p className="text-[13px] font-bold text-primary">{item.label}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
