import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VolumeChart() {
  const data = [
    { name: 'MON', WhatsApp: 4000, Email: 2400, WebChat: 2400 },
    { name: 'TUE', WhatsApp: 5000, Email: 3000, WebChat: 2800 },
    { name: 'WED', WhatsApp: 4500, Email: 2800, WebChat: 2600 },
    { name: 'THU', WhatsApp: 6000, Email: 4000, WebChat: 3200 },
    { name: 'FRI', WhatsApp: 5000, Email: 3500, WebChat: 3000 },
    { name: 'SAT', WhatsApp: 4000, Email: 2500, WebChat: 2200 },
    { name: 'SUN', WhatsApp: 6500, Email: 5000, WebChat: 4000 },
  ];

  return (
    <div className="w-full flex-1 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[15px] font-bold text-gray-900 tracking-wide">Conversation Volume by Channel</h3>
        <div className="flex gap-5">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#00C9A7]"></span> WHATSAPP</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#1A2B4A]"></span> EMAIL</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]"></span> WEB CHAT</div>
        </div>
      </div>
      <div className="flex-1 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#1A2B4A', fontWeight: 800}} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} hide />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
            <Line type="monotone" dataKey="WhatsApp" stroke="#00C9A7" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#00C9A7'}} />
            <Line type="monotone" dataKey="Email" stroke="#1A2B4A" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="WebChat" stroke="#FBBF24" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
