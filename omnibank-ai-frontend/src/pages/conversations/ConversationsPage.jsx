import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import LiveAiMonitor from './LiveAiMonitor';

export default function ConversationsPage() {
  const { tab } = useParams();
  const [view, setView] = useState('monitor'); // 'monitor' or 'chat'

  if (view === 'monitor') {
    return <LiveAiMonitor onSelectCard={() => setView('chat')} activeTab={tab} />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white relative animate-in fade-in duration-500">
      <ConversationList activeTab={tab} />
      <ChatWindow />
      
      {/* Back to Monitor button - Floating */}
      <div className="absolute top-4 left-[380px] z-50">
        <button 
          onClick={() => setView('monitor')}
          className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest shadow-sm"
        >
          ← Back to Monitor
        </button>
      </div>
    </div>
  );
}
