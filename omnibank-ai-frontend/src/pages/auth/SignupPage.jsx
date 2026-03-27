import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, User, Globe, Phone } from 'lucide-react';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Registration Details, 2: OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle passed email from login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleRegisterAndSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // For sign up, we just call sendOtp. It detects isNewUser anyway.
      const data = await authService.sendOtp(email);
      if (data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.verifyOtp(email, otp, name);
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
              {step === 1 ? 'New Agent Registration' : 'Confirm Registration'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {step === 1 ? 'Let\'s get your workspace set up' : `Entering code sent to ${email}`}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleRegisterAndSendOtp : handleFinalizeSignup} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Manas Srivastava"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal/50 focus:bg-white/10 transition-all font-medium"
                    />
                  </div>
                </div>
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
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal transition-colors">
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
                  {step === 1 ? 'Start Onboarding' : 'Complete Setup'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-center items-center gap-2 text-[11px] font-bold">
             <span className="text-slate-500">Already registered?</span>
             <button 
               onClick={() => navigate('/login')} 
               className="text-teal hover:underline"
             >
               Sign in instead
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
