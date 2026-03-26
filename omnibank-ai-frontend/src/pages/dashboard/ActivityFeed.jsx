export default function ActivityFeed() {
  const activities = [
    { title: 'Auto-resolved Ticket #4829', time: 'System • 2 mins ago', type: 'success' },
    { title: 'Escalated Ticket #4830 to Karan', time: 'AI Engine • 5 mins ago', type: 'alert' },
    { title: 'Report "Daily Volume" Exported', time: 'System • 12 mins ago', type: 'neutral' },
  ];

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex-1 flex flex-col">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Activity Feed</h3>
      
      <div className="flex flex-col gap-6 relative flex-1">
        {/* Vertical Line */}
        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
        
        {activities.map((item, idx) => (
          <div key={idx} className="flex gap-4 relative z-10">
            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ring-4 ring-white ${
              item.type === 'success' ? 'bg-teal' : item.type === 'alert' ? 'bg-amber-500' : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="text-sm font-bold text-gray-800 mb-0.5">{item.title}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider inline-block bg-gray-50 px-2 py-0.5 rounded-sm">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="bg-primary rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <p className="text-[10px] uppercase font-bold text-teal tracking-widest mb-1">Predictive Analytics</p>
          <p className="text-sm font-bold text-white tracking-wide">Projected volume: +14% next week</p>
        </div>
      </div>
    </div>
  );
}
