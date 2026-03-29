import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VolumeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/analytics/charts')
      .then(res => setData(res.data.volume))
      .catch(console.error);
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[15px] font-bold text-gray-900 tracking-wide">Conversation Volume by Channel</h3>
        <div className="flex gap-5">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#00CCA3]"></span> WHATSAPP</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#0F2F55]"></span> EMAIL</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#5865F2]"></span> DISCORD</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#0088CC]"></span> TELEGRAM</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#999999]"></span> WEB CHAT</div>
        </div>
      </div>
      <div className="flex-1 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#0F2F55', fontWeight: 800}} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} hide />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
            <Bar dataKey="WhatsApp" fill="#00CCA3" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="Email" fill="#0F2F55" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="Discord" fill="#5865F2" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="Telegram" fill="#0088CC" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="WebChat" fill="#999999" radius={[4, 4, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
