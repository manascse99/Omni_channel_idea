import { useState, useEffect } from 'react';
import api from '../../services/apiClient';

export default function IntentBreakdown() {
  const [intents, setIntents] = useState([]);

  useEffect(() => {
    api.get('/analytics/charts')
      .then(res => setIntents(res.data.intents))
      .catch(console.error);
  }, []);

  const total = intents.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="w-full">
      <h3 className="text-[15px] font-bold text-gray-900 tracking-wide mb-6">Top Intent Categories</h3>
      <div className="space-y-6">
        {intents.map((item, index) => (
          <div key={item.name}>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[12px] font-bold text-gray-700">{item.name}</span>
              <span className="text-[12px] font-black text-primary">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-teal rounded-full transition-all duration-700" 
                 style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, opacity: 1 - index * 0.15 }}
               ></div>
            </div>
          </div>
        ))}
        {intents.length === 0 && (
          <div className="py-10 text-center text-gray-400 font-medium tracking-tight">
            No intent intelligence data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
