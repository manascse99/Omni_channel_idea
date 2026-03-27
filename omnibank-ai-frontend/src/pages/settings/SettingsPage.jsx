import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Cpu, Shield, Palette, Bell, Link2, Users, Globe,
  Bot, Zap, Sliders, Check, ChevronRight, Save
} from 'lucide-react';
import AiConfigSection from '../../components/settings/AiConfigSection';
import ChannelConfigSection from '../../components/settings/ChannelConfigSection';
import SecuritySection from '../../components/settings/SecuritySection';
import BrandingSection from '../../components/settings/BrandingSection';
import NotificationsSection from '../../components/settings/NotificationsSection';
import IntegrationsSection from '../../components/settings/IntegrationsSection';
import useSettingsStore from '../../store/settingsStore';
import { useEffect } from 'react';

const SECTIONS = [
  { id: 'ai', label: 'AI Configuration', icon: Bot, color: 'text-teal bg-teal/10' },
  { id: 'channels', label: 'Channels', icon: Globe, color: 'text-blue-500 bg-blue-50' },
  { id: 'security', label: 'Security & Access', icon: Shield, color: 'text-red-400 bg-red-50' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-500 bg-amber-50' },
  { id: 'branding', label: 'Branding', icon: Palette, color: 'text-purple-500 bg-purple-50' },
  { id: 'integrations', label: 'Integrations', icon: Link2, color: 'text-indigo-500 bg-indigo-50' },
];

export default function SettingsPage() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const active = tab || 'ai';
  const { settings, fetchSettings, updateSettings, loading } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  const handleSave = async () => {
    const success = await updateSettings(localSettings);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const updateLocal = (section, updates) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  if (loading && !localSettings) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 font-bold text-gray-400">
        Loading settings...
      </div>
    );
  }

  if (!localSettings) return null;

  const renderSection = () => {
    switch (active) {
      case 'ai': return <AiConfigSection settings={localSettings.ai} onUpdate={(u) => updateLocal('ai', u)} />;
      case 'channels': return <ChannelConfigSection settings={localSettings.channels} onUpdate={(u) => updateLocal('channels', u)} />;
      // Other sections can be updated similarly as needed
      case 'security': return <SecuritySection />;
      case 'notifications': return <NotificationsSection />;
      case 'branding': return <BrandingSection settings={localSettings.branding} onUpdate={(u) => updateLocal('branding', u)} />;
      case 'integrations': return <IntegrationsSection />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-[230px] shrink-0 border-r border-gray-100 bg-gray-50/60 flex flex-col p-4 overflow-y-auto">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-3 px-2">Configuration</p>
        <div className="space-y-1">
          {SECTIONS.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => navigate(`/settings/${id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                active === id
                  ? 'bg-white shadow-sm border border-gray-100 text-primary'
                  : 'text-gray-500 hover:text-primary hover:bg-white/70'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active === id ? color : 'bg-gray-100 text-gray-400'}`}>
                <Icon size={14} />
              </div>
              <span className="text-[13px] font-bold">{label}</span>
              {active === id && <Check size={12} className="ml-auto text-teal" />}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-primary to-[#2A3F6A] rounded-2xl p-4 text-white">
            <p className="text-[11px] font-black uppercase tracking-wider text-teal mb-1">OMNI AI</p>
            <p className="text-[12px] font-semibold text-white/70 leading-tight">Platform v2.1.0 · All systems operational</p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-white/60 font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Section Header */}
        <div className="shrink-0 border-b border-gray-100 px-8 py-5 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-[20px] font-black text-primary tracking-tight">
              {SECTIONS.find(s => s.id === active)?.label}
            </h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">Configure your OMNI platform settings</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 text-[12px] font-bold">
                <Check size={13} /> Saved
              </div>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-teal hover:bg-[#00b395] text-primary font-black px-5 py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-teal/20"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
