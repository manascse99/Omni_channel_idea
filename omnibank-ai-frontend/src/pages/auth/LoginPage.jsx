import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, User, Globe, Phone } from 'lucide-react';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.sendOtp(email);
      if (data.success) {
        if (data.isNewUser) {
          // If new user, redirect to Signup with email param
          navigate(`/signup?email=${encodeURIComponent(email)}`);
        } else {
          setStep(2);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.verifyOtp(email, otp);
      if (data.success) {
        setAuth(data.agent, data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 group cursor-default">
          <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[22px] flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10 shadow-2xl shadow-teal/5">
             <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white" size={20} />
             </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">OMNI<span className="text-teal">BANK</span></h1>
          <p className="text-slate-400 font-medium text-sm tracking-wide">Artificial Intelligence Platform v2.0</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-3xl shadow-black/40">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'Welcome back' : 'Confirm Identity'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {step === 1 ? 'Sign in to your OMNI workspace' : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@omnibank.ai"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal/50 focus:bg-white/10 transition-all font-medium"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal/50 focus:bg-white/10 transition-all font-medium tracking-[0.5em] text-center"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                 <p className="text-red-400 text-xs text-center font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full group bg-teal hover:bg-teal/90 text-primary font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-teal/10 hover:shadow-teal/20 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <>
                  {step === 1 ? 'Verify Email' : 'Authorize & Enter'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {step === 2 && (
            <button 
              onClick={() => { setStep(1); setOtp(''); }}
              className="w-full mt-6 text-slate-500 hover:text-white text-xs font-bold transition-colors"
            >
              Use a different email address
            </button>
          )}

          <div className="mt-8 flex justify-center items-center gap-2 text-[11px] font-bold">
             <span className="text-slate-500">New to OMNI?</span>
             <button 
               onClick={() => navigate('/signup')} 
               className="text-teal hover:underline"
             >
               Create account
             </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Secured by OmniGuard Protocol
        </p>
      </div>
    </div>
  );
}
