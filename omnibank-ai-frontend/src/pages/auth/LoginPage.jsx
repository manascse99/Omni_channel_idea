import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import OtpInput from './OtpInput';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Phone, Globe } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      // Start resend countdown
      let t = 45;
      const interval = setInterval(() => {
        t--;
        setResendTimer(t);
        if (t <= 0) clearInterval(interval);
      }, 1000);
    }, 1000);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setAuth(
        { id: 1, name: 'Manas Srivastava', role: 'Senior Agent', phone: `+91 ${phone}`, avatar: 'MS', email: 'manas@omni.ai' },
        'omni-jwt-token-mock'
      );
      navigate('/dashboard');
    }, 800);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-white text-2xl font-black tracking-tight mb-1">Welcome back</h2>
        <p className="text-white/40 text-sm font-medium">Sign in to your OMNI workspace</p>
      </div>

      <form onSubmit={handleSendOtp} className="space-y-5">
        {/* Phone Number */}
        <div>
          <label className="block text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">
            Mobile Number
          </label>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl h-14 overflow-hidden focus-within:border-teal/60 focus-within:bg-white/[0.08] transition-all">
            {/* Fixed +91 India code */}
            <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full shrink-0">
              <Globe size={18} className="text-teal" />
              <span className="text-white/70 font-bold text-sm">+91</span>
            </div>
            <div className="flex items-center gap-3 flex-1 px-4">
              <Phone size={16} className="text-white/30 shrink-0" />
              <input
                type="tel"
                maxLength={10}
                className="flex-1 bg-transparent outline-none text-white font-semibold placeholder-white/20 text-[15px]"
                placeholder="00000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setOtpSent(false)}
                required
              />
            </div>
          </div>
        </div>

        {!otpSent && (
          <button
            type="submit"
            disabled={phone.length < 10 || loading}
            className="w-full bg-teal hover:bg-[#00b395] text-primary font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal/20 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <>Send OTP via WhatsApp <ArrowRight size={18} /></>
            )}
          </button>
        )}
      </form>

      {/* OTP Section */}
      {otpSent && (
        <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="h-px bg-white/10" />
          <div>
            <label className="block text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4 text-center">
              Enter OTP sent to +91 {phone}
            </label>
            <OtpInput length={6} onComplete={handleVerify} />
          </div>

          <div className="flex items-center justify-between text-[12px] px-1">
            <span className="text-white/40 font-medium">
              {resendTimer > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
                  Resend in 0:{String(resendTimer).padStart(2, '0')}
                </span>
              ) : (
                <span className="text-white/40">OTP expired</span>
              )}
            </span>
            <button
              onClick={() => { setOtpSent(false); setResendTimer(45); }}
              className="text-teal hover:text-teal/80 font-bold transition-colors"
            >
              Resend OTP
            </button>
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-teal hover:bg-[#00b395] text-primary font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal/20"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : 'Verify & Sign In'}
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-white/30 text-[13px]">
          New to OMNI?{' '}
          <Link to="/signup" className="text-teal hover:text-teal/80 font-bold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
