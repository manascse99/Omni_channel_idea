import { useNavigate, useParams } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import LiveAiMonitor from './LiveAiMonitor';

export default function ConversationsPage() {
  const { tab, convId } = useParams();
  const navigate = useNavigate();

  // Default to 'all' tab if none specified so the monitor is never empty on landing
  const currentTab = tab || 'all';
  
  // Show monitor if no conversation is selected
  const isMonitorView = !convId;

  if (isMonitorView) {
    return (
      <LiveAiMonitor 
        onSelectCard={(id) => navigate(`/conversations/${currentTab}/${id}`)} 
        activeTab={currentTab} 
      />
    );
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#f4f7fb] relative animate-in fade-in duration-500">
      <ConversationList 
        activeTab={currentTab} 
        activeConversationId={convId} 
        onSelect={(id) => navigate(`/conversations/${currentTab}/${id}`)} 
      />
      <ChatWindow 
        activeConversationId={convId} 
        onBack={() => navigate(`/conversations/${currentTab}`)}
      />
    </div>
  );
}
