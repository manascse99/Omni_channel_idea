import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import OtpInput from './OtpInput';
import { Landmark, ArrowRight, Smartphone } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countryCode, setCountryCode] = useState({ code: '+1', flag: '🇺🇸', name: 'US' });
  const [showCountryList, setShowCountryList] = useState(false);
  const navigate = useNavigate();

  const countries = [
    { code: '+1', flag: '🇺🇸', name: 'US' },
    { code: '+91', flag: '🇮🇳', name: 'IN' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+971', flag: '🇦🇪', name: 'AE' },
    { code: '+61', flag: '🇦🇺', name: 'AU' },
  ];

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length >= 8) setOtpSent(true);
  };

  const handleVerify = (otp = '123456') => {
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="w-[60px] h-[60px] bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-teal opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <Landmark size={30} className="text-teal relative z-10" fill="currentColor" />
      </div>
      
      <h1 className="text-[22px] font-extrabold text-primary mb-1 tracking-tight">FintechPortal</h1>
      <p className="text-[11px] font-bold tracking-[0.2em] text-teal mb-8 uppercase">AI-OMNICHANNEL</p>
      
      <h2 className="text-lg font-bold text-gray-900 mb-1">Secure Access</h2>
      <p className="text-[13px] text-gray-500 mb-8 text-center px-4">
        Verify your identity to enter the command center.
      </p>

      {/* Phone Number Input with Country Code */}
      <form onSubmit={handleSendOtp} className="w-full mt-2 relative">
        <div className="text-left mb-6">
          <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-widest mb-2 ml-1">Registered Mobile</label>
          <div className="flex bg-[#F4F6F9] rounded-xl border border-gray-200 overflow-visible shadow-inner transition-all h-14 relative group">
            <div 
              className="flex items-center pl-4 pr-2 text-primary font-bold text-sm gap-2 cursor-pointer hover:bg-gray-200/50 rounded-l-xl transition-colors border-r border-gray-200"
              onClick={() => setShowCountryList(!showCountryList)}
            >
              <span className="text-[18px]">{countryCode.flag}</span>
              <span className="text-[14px]">{countryCode.code}</span>
            </div>

            {/* Country Dropdown */}
            {showCountryList && (
              <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[200px] overflow-y-auto p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountryCode(c);
                      setShowCountryList(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-[18px]">{c.flag}</span>
                    <span className="text-[13px] font-bold text-primary">{c.name}</span>
                    <span className="ml-auto text-[11px] text-gray-400 font-medium">{c.code}</span>
                  </button>
                ))}
              </div>
            )}

            <input 
              type="text" 
              className="flex-1 bg-transparent px-4 outline-none text-gray-800 font-bold placeholder-gray-300 min-w-0 text-[15px]"
              placeholder="(555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setShowCountryList(false)}
            />
          </div>
        </div>

        <button 
          type="button"
          disabled={phone.length < 10}
          onClick={handleSendOtp}
          className={`w-full bg-[#0F7A5E] hover:bg-[#0A5A45] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[#0F7A5E]/20 mb-6 ${phone.length < 10 ? 'opacity-50 cursor-not-allowed shadow-none' : 'shadow-lg'}`}
        >
          Send OTP via WhatsApp
          <ArrowRight size={18} />
        </button>
      </form>

      {/* OTP Input Section (Always visible, might be disabled/grayed out if OTP not sent, or can just animate in, but visually stacking them) */}
      <div className={`w-full transition-all duration-300 mt-2 ${!otpSent ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="text-center mb-6">
           <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">OTP Verification</label>
           <OtpInput length={6} onComplete={handleVerify} />
        </div>

        <div className="flex items-center justify-between text-xs mb-8 px-2">
          <span className="flex items-center gap-2 text-amber-500 font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Resend in 0:45
          </span>
          <button className="text-teal hover:text-teal/80 font-bold transition-colors tracking-wide uppercase">
            Resend Now
          </button>
        </div>

        <button 
          onClick={() => handleVerify()}
          disabled={!otpSent}
          className="w-full bg-gradient-to-r from-[#00E5C0] to-[#00C2A0] hover:brightness-110 text-primary font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal/20 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          VERIFY & LOGIN
        </button>
      </div>
    </AuthLayout>
  );
}
