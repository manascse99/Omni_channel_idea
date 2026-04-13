import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ChannelDonut({ days, customRange }) {
  const [data, setData] = useState([]);
  const COLORS = ['#0F2F55', '#00CCA3', '#D9873E', '#6366f1'];

  useEffect(() => {
    let url = `/analytics/charts?days=${days || 30}`;
    if (days === 'custom' && customRange?.start && customRange?.end) {
      url = `/analytics/charts?start=${customRange.start}&end=${customRange.end}`;
    }

    api.get(url)
      .then(res => setData(res.data.channels))
      .catch(console.error);
  }, [days, customRange]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-[15px] font-bold text-gray-900 tracking-wide mb-6">Channel Distribution</h3>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 ml-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
          </div>
        ))}
        {data.length === 0 && (
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
        )}
      </div>
    </div>
  );
}
