import { useState } from 'react';
import { Palette, Sun, Moon, Type, LayoutTemplate } from 'lucide-react';

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun, preview: 'bg-white border-gray-200' },
  { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-[#1A2B4A] border-white/10' },
  { id: 'system', label: 'Auto', icon: Sun, preview: 'bg-gradient-to-br from-white to-[#1A2B4A] border-gray-200' },
];

const ACCENTS = [
  { id: 'teal', label: 'OMNI Teal', clr: '#00C9A7' },
  { id: 'blue', label: 'Ocean Blue', clr: '#3B82F6' },
  { id: 'violet', label: 'Violet', clr: '#8B5CF6' },
  { id: 'amber', label: 'Amber', clr: '#F59E0B' },
  { id: 'rose', label: 'Rose', clr: '#F43F5E' },
];

const FONTS = ['Inter', 'DM Sans', 'Satoshi', 'Geist'];

export default function BrandingSection({ settings, onUpdate }) {
  const { companyName: customName, tagline, primaryColor: accent } = settings;

  const setCustomName = (val) => onUpdate({ companyName: val });
  const setTagline = (val) => onUpdate({ tagline: val });
  const setAccent = (val) => onUpdate({ primaryColor: val });

  // For now, we'll keep theme/font/compactMode as local state or add them to the model if needed. 
  // The current Settings model only has companyName, tagline, primaryColor.
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="space-y-5">
      {/* Theme */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><Palette size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Appearance</h3>
            <p className="text-[11px] text-gray-400 font-medium">Customize the look of your OMNI workspace</p>
          </div>
        </div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Color Theme</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {THEMES.map(({ id, label, preview }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === id ? 'border-teal' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`w-10 h-10 rounded-lg border ${preview}`} />
              <span className="text-[12px] font-bold text-primary">{label}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Accent Color</p>
        <div className="flex items-center gap-3 flex-wrap">
          {ACCENTS.map(({ id, label, clr }) => (
            <button
              key={id}
              onClick={() => setAccent(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${accent === id ? 'border-teal' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="w-4 h-4 rounded-full" style={{ background: clr }} />
              <span className="text-[12px] font-bold text-primary">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography & Layout */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><Type size={18} /></div>
          <h3 className="text-[15px] font-black text-primary">Typography & Layout</h3>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Interface Font</label>
            <div className="grid grid-cols-4 gap-2">
              {FONTS.map(f => (
                <button key={f} onClick={() => setFont(f)} className={`py-2 px-3 rounded-xl border-2 text-[13px] font-bold transition-all ${font === f ? 'border-teal bg-teal/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-50">
            <div>
              <p className="text-[13px] font-bold text-primary">Compact Mode</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Reduce padding and spacing throughout the UI</p>
            </div>
            <button onClick={() => setCompactMode(c => !c)} className={`w-11 h-6 rounded-full relative transition-colors flex items-center px-1 ${compactMode ? 'bg-teal' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${compactMode ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Identity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><LayoutTemplate size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Platform Identity</h3>
            <p className="text-[11px] text-gray-400 font-medium">Customize your workspace name and branding</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Platform Name</label>
            <input
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-bold text-primary outline-none focus:border-teal/60 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tagline</label>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-primary outline-none focus:border-teal/60 focus:bg-white transition-all"
            />
          </div>
          {/* Preview */}
          <div className="bg-primary rounded-2xl p-4 flex items-center gap-3 mt-2">
            <div className="w-9 h-9 bg-teal rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-sm">{customName}</p>
              <p className="text-teal text-[9px] font-bold tracking-[0.2em] uppercase">{tagline}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
