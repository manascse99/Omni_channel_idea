import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff, Globe } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setAuth(
        { id: 1, name: formData.name, role: 'Agent', phone: `+91 ${formData.phone}`, avatar: formData.name.slice(0, 2).toUpperCase(), email: formData.email },
        'omni-jwt-token-mock'
      );
      navigate('/dashboard');
    }, 1000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Arjun Reddy' },
    { key: 'email', label: 'Work Email', type: 'email', icon: Mail, placeholder: 'you@omni.ai' },
  ];

  return (
    <AuthLayout>
      <div className="mb-7">
        <h2 className="text-white text-2xl font-black tracking-tight mb-1">Create account</h2>
        <p className="text-white/40 text-sm font-medium">Join the OMNI AI platform</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
          <div key={key}>
            <label className="block text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">{label}</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl h-13 overflow-hidden focus-within:border-teal/60 focus-within:bg-white/[0.08] transition-all h-14">
              <div className="px-4">
                <Icon size={17} className="text-white/30" />
              </div>
              <input
                type={type}
                name={key}
                className="flex-1 bg-transparent outline-none text-white font-semibold placeholder-white/20 text-[15px] pr-4"
                placeholder={placeholder}
                value={formData[key]}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        ))}

        {/* Phone — fixed +91 */}
        <div>
          <label className="block text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">Mobile Number</label>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl h-14 overflow-hidden focus-within:border-teal/60 focus-within:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full shrink-0">
              <Globe size={18} className="text-teal" />
              <span className="text-white/70 font-bold text-sm">+91</span>
            </div>
            <div className="flex items-center gap-3 flex-1 px-4">
              <Phone size={16} className="text-white/30 shrink-0" />
              <input
                type="tel"
                name="phone"
                maxLength={10}
                className="flex-1 bg-transparent outline-none text-white font-semibold placeholder-white/20 text-[15px]"
                placeholder="00000 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                required
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">Password</label>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl h-14 overflow-hidden focus-within:border-teal/60 focus-within:bg-white/[0.08] transition-all">
            <div className="px-4">
              <Lock size={17} className="text-white/30" />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              className="flex-1 bg-transparent outline-none text-white font-semibold placeholder-white/20 text-[15px]"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="px-4 text-white/30 hover:text-white/60 transition-colors">
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal hover:bg-[#00b395] text-primary font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal/20 disabled:opacity-60 mt-2"
          style={{ marginTop: '20px' }}
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <>Create Account <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-white/30 text-[13px]">
          Already have an account?{' '}
          <Link to="/login" className="text-teal hover:text-teal/80 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
