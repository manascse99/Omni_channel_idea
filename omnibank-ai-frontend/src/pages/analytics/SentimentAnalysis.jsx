import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Sparkles } from 'lucide-react';

export default function SentimentAnalysis() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/analytics/charts')
      .then(res => setData(res.data.sentiments))
      .catch(console.error);
  }, []);

  const COLORS = {
    'Positive': '#00CCA3',
    'Neutral': '#D9873E',
    'Negative': '#ef4444'
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-8">
        <h3 className="text-[15px] font-bold text-gray-900 tracking-wide">Sentiment Analysis</h3>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
           <Sparkles size={12} fill="currentColor" /> AI INSIGHTS
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between items-center bg-gray-50 p-4 rounded-xl">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer NPS</p>
          <p className="text-xl font-black text-primary">72.4</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Improving</p>
          <p className="text-[12px] font-bold text-gray-400">+4.2% from last week</p>
        </div>
      </div>
    </div>
  );
}
