import { useState } from 'react';
import { Link2, Check, ExternalLink, Zap, MessageSquare, Smartphone, Mail, Cloud, Headphones, Disc, Hash, BarChart3 } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'WhatsApp Business', logo: MessageSquare, desc: 'Connect WhatsApp Business API for messaging', connected: true, category: 'Messaging' },
  { name: 'Twilio SMS', logo: Smartphone, desc: 'SMS campaigns and OTP via Twilio', connected: true, category: 'Messaging' },
  { name: 'Sendgrid Email', logo: Mail, desc: 'Transactional email delivery', connected: false, category: 'Email' },
  { name: 'Salesforce CRM', logo: Cloud, desc: 'Sync customer data with Salesforce', connected: false, category: 'CRM' },
  { name: 'Zendesk', logo: Headphones, desc: 'Import existing Zendesk ticket history', connected: false, category: 'CRM' },
  { name: 'Jira', logo: Disc, desc: 'Create Jira tickets from escalated conversations', connected: false, category: 'Productivity' },
  { name: 'Slack', logo: Hash, desc: 'Post alerts and reports to Slack channels', connected: true, category: 'Productivity' },
  { name: 'Google Analytics', logo: BarChart3, desc: 'Track omnichannel conversion events', connected: false, category: 'Analytics' },
];

export default function IntegrationsSection() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

  const toggle = (name) => setIntegrations(prev => prev.map(i => i.name === name ? { ...i, connected: !i.connected } : i));

  return (
    <div className="space-y-5">
      {/* Webhook */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><Zap size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Webhook Endpoint</h3>
            <p className="text-[11px] text-gray-400 font-medium">Receive real-time event payloads</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-[12px] text-gray-600 truncate">
            https://api.omni.ai/webhooks/v1/events
          </div>
          <button className="bg-primary text-white font-bold px-4 py-3 rounded-xl text-[12px] hover:bg-primary/90 transition-colors whitespace-nowrap">
            Regenerate
          </button>
        </div>
      </div>

      {/* Integrations */}
      {categories.map(cat => (
        <div key={cat} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-wider mb-4">{cat}</h3>
          <div className="space-y-3">
            {integrations.filter(i => i.category === cat).map(({ name, desc, connected, logo: Icon }) => (
              <div key={name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-primary">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary">{name}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {connected && (
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      <Check size={10} /> Connected
                    </div>
                  )}
                  <button
                    onClick={() => toggle(name)}
                    className={`text-[12px] font-bold px-4 py-2 rounded-xl transition-all ${
                      connected
                        ? 'text-red-400 hover:bg-red-50 border border-gray-100'
                        : 'bg-teal text-primary hover:bg-[#00b395] shadow-md shadow-teal/20'
                    }`}
                  >
                    {connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
