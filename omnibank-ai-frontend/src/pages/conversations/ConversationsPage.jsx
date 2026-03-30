import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import LiveAiMonitor from './LiveAiMonitor';

export default function ConversationsPage() {
  const { tab } = useParams();
  const location = useLocation();
  const [view, setView] = useState('monitor'); // 'monitor' or 'chat'
  const [activeConversationId, setActiveConversationId] = useState(null);

  useEffect(() => {
    if (location.state?.activeConversationId) {
      setActiveConversationId(location.state.activeConversationId);
      setView('chat');
    }
  }, [location.state]);

  if (view === 'monitor') {
    return <LiveAiMonitor onSelectCard={(id) => {
      setActiveConversationId(id);
      setView('chat');
    }} activeTab={tab} />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white relative animate-in fade-in duration-500">
      <ConversationList 
        activeTab={tab} 
        activeConversationId={activeConversationId} 
        onSelect={(id) => setActiveConversationId(id)} 
      />
      <ChatWindow 
        activeConversationId={activeConversationId} 
        onBack={() => setView('monitor')}
      />
    </div>
  );
}
