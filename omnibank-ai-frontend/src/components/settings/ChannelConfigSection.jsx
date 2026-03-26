import { useState } from 'react';
import { Globe, MessageSquare, Check, Smartphone, Phone, Mail, Camera } from 'lucide-react';

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageSquare, color: 'text-green-600 bg-green-50', connected: true, msgs: '8,421', uptime: '99.9%' },
  { id: 'sms', label: 'SMS / Twilio', icon: Smartphone, color: 'text-blue-500 bg-blue-50', connected: true, msgs: '2,140', uptime: '99.7%' },
  { id: 'voice', label: 'Voice / IVR', icon: Phone, color: 'text-purple-500 bg-purple-50', connected: true, msgs: '932', uptime: '98.5%' },
  { id: 'email', label: 'Email', icon: Mail, color: 'text-amber-500 bg-amber-50', connected: false, msgs: '—', uptime: '—' },
  { id: 'instagram', label: 'Instagram DM', icon: Camera, color: 'text-rose-500 bg-rose-50', connected: false, msgs: '—', uptime: '—' },
  { id: 'web', label: 'Web Chat Widget', icon: Globe, color: 'text-teal bg-teal/10', connected: true, msgs: '5,287', uptime: '100%' },
];

export default function ChannelConfigSection() {
  const [channels, setChannels] = useState(CHANNELS);
  const [aiOnAll, setAiOnAll] = useState(true);
  const [routing, setRouting] = useState('round-robin');

  const toggleChannel = (id) => setChannels(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));

  return (
    <div className="space-y-5">
      {/* Global Channel Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Globe size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Global Channel Settings</h3>
            <p className="text-[11px] text-gray-400 font-medium">Configurations that apply across all channels</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-[13px] font-bold text-primary">AI Response on All Channels</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Enable AI auto-reply across all connected channels simultaneously</p>
            </div>
            <button onClick={() => setAiOnAll(a => !a)} className={`w-11 h-6 rounded-full relative transition-colors flex items-center px-1 ${aiOnAll ? 'bg-teal' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${aiOnAll ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="py-3">
            <p className="text-[13px] font-bold text-primary mb-1.5">Routing Strategy</p>
            <p className="text-[11px] text-gray-400 font-medium mb-3">How incoming conversations are assigned to agents</p>
            <div className="grid grid-cols-3 gap-2">
              {['round-robin', 'least-busy', 'skill-based'].map(r => (
                <button key={r} onClick={() => setRouting(r)} className={`py-2.5 rounded-xl border-2 text-[12px] font-bold capitalize transition-all ${routing === r ? 'border-teal bg-teal/5 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  {r.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Channel List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><MessageSquare size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Connected Channels</h3>
            <p className="text-[11px] text-gray-400 font-medium">Manage active communication channels</p>
          </div>
          <div className="ml-auto bg-teal/10 text-teal text-[11px] font-black px-3 py-1 rounded-full">
            {channels.filter(c => c.connected).length} Active
          </div>
        </div>

        <div className="space-y-3">
          {channels.map(({ id, label, icon: Icon, color, connected, msgs, uptime }) => (
            <div key={id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${connected ? 'border-gray-100 bg-gray-50/50' : 'border-dashed border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-primary">{label}</p>
                    {connected && <span className="text-[9px] bg-green-100 text-green-600 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><Check size={8} />Live</span>}
                  </div>
                  {connected ? (
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{msgs} msgs this month · {uptime} uptime</p>
                  ) : (
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Not connected</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleChannel(id)}
                className={`text-[12px] font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${connected ? 'text-red-400 hover:bg-red-50 border border-gray-100' : 'bg-teal text-primary hover:bg-[#00b395] shadow-md shadow-teal/20'}`}
              >
                {connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
