import { Mail, Phone, Calendar, Clock, Globe, MessageSquare, Link2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function UserProfileSidebar({ user, onProfileUpdated }) {
  const [mergeTarget, setMergeTarget] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const handleManualMerge = async () => {
    if (!mergeTarget) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('agentToken');
      const res = await axios.post('http://localhost:5001/api/users/merge/manual', {
        primaryUserId: user._id,
        targetEmailOrPhone: mergeTarget
      }, { headers: { Authorization: `Bearer ${token}` }});
      
      setSuccess('Mapped successfully!');
      if (onProfileUpdated) onProfileUpdated(res.data.user);
      setMergeTarget('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to merge identities');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!mergeTarget.includes('@')) {
      setError('OTP requires an email');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('agentToken');
      await axios.post('http://localhost:5001/api/users/merge/request-otp', {
        email: mergeTarget
      }, { headers: { Authorization: `Bearer ${token}` }});
      
      setOtpSent(true);
      setSuccess('OTP sent!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('agentToken');
      const res = await axios.post('http://localhost:5001/api/users/merge/verify-otp', {
        primaryUserId: user._id,
        email: mergeTarget,
        otp: otpCode
      }, { headers: { Authorization: `Bearer ${token}` }});
      
      setSuccess('OTP Verified & Merged!');
      setOtpSent(false); setOtpCode(''); setMergeTarget('');
      if (onProfileUpdated) onProfileUpdated(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* Header Profile Photo */}
      <div className="p-8 flex flex-col items-center border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-[#E5F5EF] text-[#0F7A5E] flex items-center justify-center font-black text-2xl shadow-sm border-4 border-white">
          {(user.name || 'U')[0].toUpperCase()}
        </div>
        <h3 className="mt-4 text-[16px] font-bold text-gray-900">{user.name || 'Unknown User'}</h3>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Customer Profile</p>
      </div>

      {/* Details Section */}
      <div className="p-6 flex flex-col gap-6 flex-1">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Contact Information</label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Email</p>
                <p className="text-[13px] font-bold text-gray-800 truncate">{user.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Phone size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Phone</p>
                <p className="text-[13px] font-bold text-gray-800 truncate">{user.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Connected Channels</label>
           <div className="flex flex-wrap gap-2">
             {user.channelHistory?.map(ch => (
               <span key={ch} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                 {ch === 'email' && <Mail size={12} className="text-blue-500" />}
                 {ch === 'webchat' && <Globe size={12} className="text-purple-500" />}
                 {ch === 'whatsapp' && <Phone size={12} className="text-green-500" />}
                 {ch === 'discord' && <MessageSquare size={12} className="text-indigo-500" />}
                 {ch}
               </span>
             ))}
           </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
             <Link2 size={12}/> Identity Merging
           </label>
           <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
             <p className="text-[10px] text-gray-500 font-bold pb-2">Link this conversation sequence to an existing known profile.</p>
             <input type="text" placeholder="Email or Phone..." value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} disabled={loading || otpSent} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[12px] font-bold outline-none focus:border-[#0F2F55] mb-2" />
             
             {error && <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 mb-2"><AlertCircle size={10}/> {error}</div>}
             {success && <div className="text-[10px] text-green-600 font-bold flex items-center gap-1 mb-2"><ShieldCheck size={10}/> {success}</div>}

             {!otpSent ? (
               <div className="flex gap-2">
                 <button onClick={handleManualMerge} disabled={loading || !mergeTarget} className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50 transition-colors">Direct Link</button>
                 <button onClick={handleSendOtp} disabled={loading || !mergeTarget} className="flex-1 bg-[#0F2F55] text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#0F2F55]/90 disabled:opacity-50 transition-colors">Verify OTP</button>
               </div>
             ) : (
               <div className="mt-2">
                 <input type="text" placeholder="6-digit OTP code" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[12px] font-bold outline-none focus:border-[#0F2F55] tracking-widest text-center mb-2" />
                 <button onClick={handleVerifyOtp} disabled={loading || !otpCode} className="w-full bg-[#00CCA3] text-[#0F2F55] py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-105 disabled:opacity-50 transition-all shadow-[0_2px_10px_rgba(0,204,163,0.3)] border border-[#00CCA3] mb-2">Confirm Link</button>
                 <button onClick={() => {setOtpSent(false); setOtpCode('');}} className="w-full text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
               </div>
             )}
           </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="p-6 border-t border-gray-100">
        <div className="bg-[#0F2F55] p-4 rounded-xl">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">OmniBank Verified</p>
           <p className="text-[12px] font-bold text-white tracking-widest">Profile Consolidated</p>
        </div>
      </div>
    </div>
  );
}
