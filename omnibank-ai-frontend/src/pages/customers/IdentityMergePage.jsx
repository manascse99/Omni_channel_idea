import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import { 
  ArrowLeft, Search, User, Mail, Phone, MessageSquare, 
  ChevronRight, Link2, ShieldCheck, AlertCircle, CheckCircle2,
  Clock, Globe
} from 'lucide-react';

export default function IdentityMergePage() {
  const { primaryUserId } = useParams();
  const navigate = useNavigate();

  const [primaryData, setPrimaryData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [merging, setMerging] = useState(false);
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (!primaryUserId) return;
      console.log(`[MERGE_PAGE] Initializing for: ${primaryUserId}`);
      
      const safetyTimeout = setTimeout(() => {
        if (loading) {
          setLoading(false);
          window.alert("NETWORK HANG: The server is taking too long to respond. Please check if your backend is running on Port 5001.");
        }
      }, 10000);

      try {
        const res = await api.get(`/identity-direct/${primaryUserId}`);
        clearTimeout(safetyTimeout);
        // window.alert('IDENTITY SERVER CONNECTED!');
        setPrimaryData(res.data);
        setLoading(false);
      } catch (err) {
        clearTimeout(safetyTimeout);
        console.error('[MERGE_PAGE] Init Error:', err);
        setLoading(false);
        const errorMsg = err.response?.data?.error || err.message;
        window.alert(`CONNECTIVITY ERROR: ${errorMsg}\n\n1. Ensure backend is on 5001.\n2. Ensure you are logged in.`);
      }
    };
    initData();
  }, [primaryUserId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/users/search?q=${searchQuery}`);
      // Filter out the primary user from results
      setSearchResults(res.data.users.filter(u => u._id !== primaryUserId));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const selectTarget = async (userId) => {
    setSearching(true);
    try {
      const res = await api.get(`/users/${userId}/details`);
      setTargetData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleMerge = async () => {
    if (!primaryData || !targetData) return;
    if (!window.confirm(`Are you sure you want to merge ${targetData.user.name || 'this user'} into ${primaryData.user.name || 'this profile'}? This action cannot be undone.`)) return;
    
    setMerging(true);
    try {
      const targetIdent = targetData.user.email || targetData.user.phone;
      await api.post('/users/merge/manual', {
        primaryUserId: primaryData.user._id,
        targetEmailOrPhone: targetIdent
      });
      alert('Identities consolidated successfully!');
      navigate('/conversations');
    } catch (err) {
      alert(err.response?.data?.error || 'Merge failed');
    } finally {
      setMerging(false);
    }
  };

  const handleSendOtp = async () => {
    if (!targetData?.user?.email) return;
    setOtpLoading(true);
    try {
      await api.post('/users/merge/request-otp', { email: targetData.user.email });
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post('/users/merge/verify-otp', {
        primaryUserId: primaryData.user._id,
        email: targetData.user.email,
        otp: otpCode
      });
      alert('OTP Verified & Merged!');
      navigate('/conversations');
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading || !primaryData || !primaryData.user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0F2F55] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Initializing Merge Context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[16px] font-black text-[#0F2F55] leading-none">Identity Merge Center</h1>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1.5 opacity-60">Reconcile Customer Identities</p>
          </div>
        </div>
        
        {targetData && (
          <div className="flex items-center gap-3">
             {!otpSent ? (
               <>
                 {targetData.user.email && (
                   <button 
                     onClick={handleSendOtp} 
                     disabled={otpLoading}
                     className="h-10 px-5 bg-white border border-gray-200 text-gray-700 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                   >
                     <ShieldCheck size={16} className="text-gray-400" /> Verify with OTP
                   </button>
                 )}
                 <button 
                   onClick={handleMerge} 
                   disabled={merging}
                   className="h-10 px-6 bg-[#0F2F55] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
                 >
                   <Link2 size={16} /> Link Identities
                 </button>
               </>
             ) : (
               <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-1 px-3 rounded-xl">
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">OTP Sent to {targetData.user.email}</p>
                 <button onClick={() => setOtpSent(false)} className="text-[10px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase">Cancel</button>
               </div>
             )}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Panel: Primary User */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <span className="text-[10px] font-black text-[#0F2F55] uppercase tracking-widest px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">Current Profile</span>
            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
              <CheckCircle2 size={12} /> Master Source
            </div>
          </div>
          
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-3xl shadow-inner border border-blue-100">
               {(primaryData.user.name || 'U')[0].toUpperCase()}
            </div>
            <h2 className="mt-6 text-xl font-black text-gray-900">{primaryData.user.name || 'Anonymous User'}</h2>
            <div className="flex gap-2 mt-4">
              {primaryData.user.channelHistory?.map(ch => (
                 <span key={ch} className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest">{ch}</span>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 flex-1 overflow-y-auto">
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Identity Details</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Email</p>
                        <p className="text-xs font-bold text-gray-900 mt-1 truncate">{primaryData.user.email || 'Not Linked'}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Phone</p>
                        <p className="text-xs font-bold text-gray-900 mt-1 truncate">{primaryData.user.phone || 'Not Linked'}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Recent Interactions Preview</label>
                 <div className="space-y-3">
                    {primaryData.messages.map((m, i) => (
                      <div key={i} className={`p-4 rounded-[20px] text-xs leading-relaxed ${m.senderType === 'user' ? 'bg-blue-50/50 text-gray-700 ml-0 mr-8 rounded-tl-none' : 'bg-gray-50 text-gray-500 ml-8 mr-0 rounded-tr-none'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase text-blue-600/60 leading-none">via {m.channel}</span>
                          <span className="text-[8px] font-bold text-gray-300 leading-none">{new Date(m.timestamp).toLocaleString()}</span>
                        </div>
                        {m.content}
                      </div>
                    ))}
                    {primaryData.messages.length === 0 && <p className="text-center py-10 text-gray-300 font-bold text-xs">No prior interaction history</p>}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Central Link Visual */}
        <div className="flex flex-col items-center justify-center pt-24 shrink-0">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${targetData ? 'bg-[#0F2F55] text-white scale-110 shadow-xl' : 'bg-gray-200 text-gray-400'}`}>
              <Link2 size={24} className={targetData ? 'animate-pulse' : ''} />
           </div>
           <div className="w-[2px] h-24 bg-gradient-to-b from-transparent via-gray-200 to-transparent my-4"></div>
        </div>

        {/* Right Panel: Search & Target User */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative">
          
          {/* Search Overlay if no target selected */}
          {!targetData ? (
            <div className="p-8 flex flex-col h-full bg-white relative z-10">
               <div className="text-center mt-10 mb-10">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-gray-300" />
                 </div>
                 <h3 className="text-lg font-black text-gray-900 leading-none">Find Target Identity</h3>
                 <p className="text-xs text-gray-400 font-bold mt-2 leading-relaxed">Search for an existing customer profile to merge <br/> with this current conversation.</p>
               </div>

               <form onSubmit={handleSearch} className="relative mb-8">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Search by Name, Email, or Phone..." 
                   className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 pl-14 text-sm font-bold outline-none focus:bg-white focus:border-[#0F2F55] transition-all"
                 />
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               </form>

               <div className="flex-1 overflow-y-auto space-y-3">
                 {searching ? (
                   <div className="p-20 text-center">
                     <div className="w-8 h-8 border-3 border-[#0F2F55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Searching database...</p>
                   </div>
                 ) : searchResults.length > 0 ? (
                   searchResults.map(u => (
                     <button key={u._id} onClick={() => selectTarget(u._id)} className="w-full p-5 rounded-2xl border border-gray-100 hover:border-[#0F2F55] hover:bg-gray-50/50 transition-all text-left flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#0F2F55] group-hover:text-white transition-all">
                             <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 leading-none mb-1">{u.name || 'Anonymous'}</p>
                            <p className="text-[10px] font-bold text-gray-400">{u.email || u.phone || 'No identifier'}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-[#0F2F55] transition-colors" size={18} />
                     </button>
                   ))
                 ) : searchQuery && !searching && (
                   <div className="text-center py-20 text-gray-300 font-bold text-xs">No matching identities found.</div>
                 )}
               </div>
            </div>
          ) : (
            <>
               <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-teal-50/30">
                <span className="text-[10px] font-black text-[#0F7A5E] uppercase tracking-widest px-3 py-1 bg-white border border-teal-100 rounded-full shadow-sm">Target Identity</span>
                <button onClick={() => setTargetData(null)} className="text-gray-400 hover:text-red-500 font-black text-[10px] uppercase transition-colors">Change Selection</button>
              </div>

              {otpSent ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-8">
                     <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 leading-none mb-4">Enter Verification Code</h3>
                  <p className="text-xs text-gray-400 font-bold leading-relaxed mb-8">We've sent a 6-digit verification code to <br/><b className="text-gray-700">{targetData.user.email}</b>. This ensures the agent has verified the customer's property.</p>
                  
                  <input 
                    type="text" 
                    placeholder="000000"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-3xl font-black text-center tracking-[0.8em] outline-none focus:bg-white focus:border-emerald-500 mb-8 max-w-[280px]"
                  />

                  <div className="flex flex-col gap-3 w-full max-w-[280px]">
                    <button onClick={handleVerifyOtp} disabled={otpLoading || otpCode.length < 6} className="w-full h-14 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl hover:brightness-105 transition-all shadow-lg disabled:opacity-50">Complete Verification</button>
                    <button onClick={() => setOtpSent(false)} className="w-full py-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">Back to Comparison</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-8 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-3xl shadow-inner border border-teal-100">
                      {(targetData.user.name || 'U')[0].toUpperCase()}
                    </div>
                    <h2 className="mt-6 text-xl font-black text-gray-900">{targetData.user.name || 'Anonymous User'}</h2>
                    <div className="flex gap-2 mt-4">
                      {targetData.user.channelHistory?.map(ch => (
                        <span key={ch} className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest">{ch}</span>
                      ))}
                    </div>
                  </div>

                  <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Identity Details</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white flex items-center gap-3">
                              <Mail size={16} className="text-gray-400" />
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Email</p>
                                <p className="text-xs font-bold text-gray-900 mt-1 truncate">{targetData.user.email || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white flex items-center gap-3">
                              <Phone size={16} className="text-gray-400" />
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Phone</p>
                                <p className="text-xs font-bold text-gray-900 mt-1 truncate">{targetData.user.phone || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Interactions to be Merged In</label>
                        <div className="space-y-3 pb-8">
                            {targetData.messages.map((m, i) => (
                              <div key={i} className={`p-4 rounded-[20px] text-xs leading-relaxed ${m.senderType === 'user' ? 'bg-teal-50/50 text-gray-700 ml-0 mr-8 rounded-tl-none' : 'bg-gray-50 text-gray-500 ml-8 mr-0 rounded-tr-none'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-black uppercase text-teal-600/60 leading-none">via {m.channel}</span>
                                  <span className="text-[8px] font-bold text-gray-300 leading-none">{new Date(m.timestamp).toLocaleString()}</span>
                                </div>
                                {m.content}
                              </div>
                            ))}
                            {targetData.messages.length === 0 && <p className="text-center py-10 text-gray-300 font-bold text-xs">No interaction history found for this profile.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

      </div>

      {/* Action Footer */}
      {targetData && !otpSent && (
        <div className="p-6 px-12 bg-white border-t border-gray-200 flex items-center justify-between animate-in slide-in-from-bottom duration-500">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#0F2F55]">
                <AlertCircle size={24} />
             </div>
             <div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">Confirm Identity Link</p>
                <p className="text-[11px] font-bold text-gray-400">Merging will permanently combine all messages, notifications, and contact details from both profiles.</p>
             </div>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={() => setTargetData(null)}
                className="h-14 px-8 text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleMerge}
                disabled={merging}
                className="h-14 px-10 bg-emerald-500 text-[#0F2F55] text-xs font-black uppercase tracking-widest rounded-2xl hover:brightness-105 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center gap-2"
              >
                {merging ? 'Processing...' : 'Consolidate Identities'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
