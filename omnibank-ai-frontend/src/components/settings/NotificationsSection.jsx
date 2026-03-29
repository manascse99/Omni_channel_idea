import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Volume2 } from 'lucide-react';

const Toggle = ({ k, settings, onToggle }) => (
  <button
    onClick={() => onToggle(k)}
    className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${settings[k] ? 'bg-teal' : 'bg-gray-200'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings[k] ? 'translate-x-[20px]' : 'translate-x-0'}`} />
  </button>
);

const Section = (props) => {
  const { icon: Icon, title, color, items, settings, onToggle } = props;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
        <h3 className="text-[15px] font-black text-primary">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-[13px] font-bold text-primary">{label}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
            </div>
            <Toggle k={key} settings={settings} onToggle={onToggle} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function NotificationsSection() {
  const [settings, setSettings] = useState({
    newConversation: true,
    agentMention: true,
    escalation: true,
    aiAlert: false,
    dailyReport: true,
    weeklyDigest: true,
    systemAlert: true,
    emailNew: false,
    emailEscalation: true,
    emailReport: true,
    smsUrgent: false,
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-5">
      <Section icon={Bell} title="In-App Notifications" color="text-amber-500 bg-amber-50"
        settings={settings} onToggle={toggle}
        items={[
          { key: 'newConversation', label: 'New Conversation', desc: 'Alert when a new conversation is assigned to you' },
          { key: 'agentMention', label: 'Agent Mentions', desc: 'Notify when someone @mentions you' },
          { key: 'escalation', label: 'Escalations', desc: 'Alert when a conversation is escalated' },
          { key: 'aiAlert', label: 'AI Confidence Alerts', desc: 'Notify when AI confidence drops below threshold' },
        ]}
      />
      <Section icon={Mail} title="Email Notifications" color="text-blue-500 bg-blue-50"
        settings={settings} onToggle={toggle}
        items={[
          { key: 'emailNew', label: 'New Conversations', desc: 'Send email for every new conversation' },
          { key: 'emailEscalation', label: 'Escalation Alerts', desc: 'Email when a conversation is escalated' },
          { key: 'emailReport', label: 'Performance Reports', desc: 'Daily and weekly summary reports' },
        ]}
      />
      <Section icon={Volume2} title="Report & Digest" color="text-indigo-500 bg-indigo-50"
        settings={settings} onToggle={toggle}
        items={[
          { key: 'dailyReport', label: 'Daily Report', desc: 'Automated daily performance summary' },
          { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Comprehensive weekly performance digest every Monday' },
          { key: 'systemAlert', label: 'System Alerts', desc: 'Critical system health and uptime notifications' },
        ]}
      />
    </div>
  );
}
