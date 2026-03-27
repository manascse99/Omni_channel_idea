import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { Shield, KeyRound, Eye, EyeOff, Fingerprint, Laptop2, Smartphone, Clock, Check } from 'lucide-react';

export default function SecuritySection() {
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // The 'user' state is typically fetched from an authentication store, not dummy data.
  // Assuming useAuthStore is a valid hook for fetching user data.
  const user = useAuthStore(state => state.user);

  // Removed dummy sessions data. In a real application, this would be fetched from an API.
  const sessions = []; 

  return (
    <div className="space-y-5">
      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400"><KeyRound size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Change Password</h3>
            <p className="text-[11px] text-gray-400 font-medium">Update your OMNI account password</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Current Password', show: showCurrent, toggle: setShowCurrent },
            { label: 'New Password', show: showNew, toggle: setShowNew },
          ].map(({ label, show, toggle }) => (
            <div key={label}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl h-12 focus-within:border-teal/60 focus-within:bg-white transition-all">
                <input type={show ? 'text' : 'password'} className="flex-1 bg-transparent px-4 outline-none text-[14px] font-semibold text-primary" placeholder="••••••••" />
                <button type="button" onClick={() => toggle(!show)} className="px-4 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button className="bg-primary hover:bg-primary/90 text-white font-black px-5 py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-primary/20">
            Update Password
          </button>
        </div>
      </div>

      {/* 2FA & Security Options */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400"><Fingerprint size={18} /></div>
          <h3 className="text-[15px] font-black text-primary">Security Options</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Two-Factor Authentication', desc: 'Use authenticator app for login verification', key: 'twofa', val: twoFA, set: setTwoFA },
            { label: 'IP Whitelist', desc: 'Restrict logins to specific IP addresses', key: 'ip', val: ipWhitelist, set: setIpWhitelist },
          ].map(({ label, desc, key, val, set }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[13px] font-bold text-primary">{label}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
              </div>
              <button onClick={() => set(!val)} className={`w-11 h-6 rounded-full relative transition-colors flex items-center px-1 ${val ? 'bg-teal' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${val ? 'translate-x-[20px]' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}

          <div className="py-3">
            <p className="text-[13px] font-bold text-primary mb-1.5">Session Timeout</p>
            <p className="text-[11px] text-gray-400 font-medium mb-3">Auto-logout after inactivity</p>
            <select
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-primary outline-none focus:border-teal/60 w-full"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400"><Laptop2 size={18} /></div>
          <h3 className="text-[15px] font-black text-primary">Active Sessions</h3>
        </div>
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  {s.device.includes('iPhone') ? <Smartphone size={16} className="text-gray-500" /> : <Laptop2 size={16} className="text-gray-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-primary">{s.device}</p>
                    {s.current && <span className="text-[9px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                  </div>
                  <p className="text-[11px] text-gray-400">{s.browser} · {s.location}</p>
                  <p className="text-[10px] text-gray-300 flex items-center gap-1 mt-0.5"><Clock size={9} /> {s.time}</p>
                </div>
              </div>
              {!s.current && (
                <button className="text-[12px] font-bold text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
