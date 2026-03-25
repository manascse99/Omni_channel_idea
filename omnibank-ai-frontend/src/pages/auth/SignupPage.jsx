import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Landmark, ArrowRight, Smartphone, Mail, User, Lock } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [countryCode, setCountryCode] = useState({ code: '+91', flag: '🇮🇳', name: 'IN' });
  const [showCountryList, setShowCountryList] = useState(false);
  const navigate = useNavigate();

  const countries = [
    { code: '+1', flag: '🇺🇸', name: 'US' },
    { code: '+91', flag: '🇮🇳', name: 'IN' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+971', flag: '🇦🇪', name: 'AE' },
    { code: '+61', flag: '🇦🇺', name: 'AU' },
  ];

  const handleSignup = (e) => {
    e.preventDefault();
    // In a real application, you would send formData and countryCode to your backend
    console.log('Signup Data:', { ...formData, countryCode: countryCode.code });
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthLayout>
      <div className="w-[80px] h-[80px] bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl mx-auto relative overflow-hidden group">
        <div className="absolute inset-0 bg-teal opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <Landmark size={40} className="text-teal relative z-10" fill="currentColor" />
      </div>
      
      <h1 className="text-[28px] font-extrabold text-primary mb-1 tracking-tight text-center">FintechPortal</h1>
      <p className="text-[12px] font-bold tracking-[0.2em] text-teal mb-8 uppercase text-center">AI-OMNICHANNEL</p>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Create an Account</h2>
      <p className="text-[14px] text-gray-500 mb-8 text-center px-4">
        Join the next generation of omnichannel AI banking.
      </p>

      <form onSubmit={handleSignup} className="w-full mx-auto">
        {/* Name */}
        <div className="mb-5">
          <label className="block text-[12px] font-bold text-gray-800 uppercase tracking-widest mb-2 ml-1">Full Name</label>
          <div className="flex bg-[#F4F6F9] rounded-xl border border-gray-200 overflow-hidden shadow-inner transition-all h-14">
            <div className="flex items-center px-4 text-gray-400"><User size={20} /></div>
            <input 
              type="text" 
              name="name"
              className="flex-1 bg-transparent px-2 outline-none text-gray-800 font-bold placeholder-gray-300 text-[15px]" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-[12px] font-bold text-gray-800 uppercase tracking-widest mb-2 ml-1">Work Email</label>
          <div className="flex bg-[#F4F6F9] rounded-xl border border-gray-200 overflow-hidden shadow-inner transition-all h-14">
            <div className="flex items-center px-4 text-gray-400"><Mail size={20} /></div>
            <input 
              type="email" 
              name="email"
              className="flex-1 bg-transparent px-2 outline-none text-gray-800 font-bold placeholder-gray-300 text-[15px]" 
              placeholder="john@fintechportal.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        {/* Phone */}
        <div className="mb-5 relative">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
          <div className="flex bg-[#F4F6F9] rounded-xl border border-gray-200 overflow-visible shadow-inner h-14 relative group">
            <div 
              className="flex items-center pl-4 pr-2 text-primary font-bold text-sm gap-2 cursor-pointer hover:bg-gray-200/50 rounded-l-xl transition-colors border-r border-gray-200"
              onClick={() => setShowCountryList(!showCountryList)}
            >
              <span className="text-[18px]">{countryCode.flag}</span>
              <span className="text-[14px]">{countryCode.code}</span>
            </div>

            {/* Country Dropdown */}
            {showCountryList && (
              <div className="absolute top-full left-0 mt-1 w-[180px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[200px] overflow-y-auto p-1 animate-in fade-in slide-in-from-top-1 duration-200">
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
              name="phone"
              className="flex-1 bg-transparent px-4 outline-none text-gray-800 font-bold placeholder-gray-300 text-[15px]" 
              placeholder="(555) 000-0000" 
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => setShowCountryList(false)}
              required 
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-10">
          <label className="block text-[12px] font-bold text-gray-800 uppercase tracking-widest mb-2 ml-1">Password</label>
          <div className="flex bg-[#F4F6F9] rounded-xl border border-gray-200 overflow-hidden shadow-inner transition-all h-14">
            <div className="flex items-center px-4 text-gray-400"><Lock size={20} /></div>
            <input 
              type="password" 
              name="password"
              className="flex-1 bg-transparent px-2 outline-none text-gray-800 font-bold placeholder-gray-300 text-[15px]" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-[#0F7A5E] hover:bg-[#0A5A45] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0F7A5E]/20 mb-6 text-lg">
          Create Account <ArrowRight size={20} />
        </button>

        <p className="text-center text-[14px] font-medium text-gray-500">
          Already have an account? <Link to="/login" className="text-teal hover:text-teal/80 underline font-extrabold px-1 tracking-tight">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
