import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChannelDonut() {
  const data = [
    { name: 'WhatsApp', value: 55, color: '#00C9A7' },
    { name: 'Email', value: 25, color: '#1A2B4A' },
    { name: 'Web Chat', value: 20, color: '#FBBF24' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col min-h-[300px]">
      <h3 className="text-[15px] font-bold text-gray-900 mb-6 tracking-wide">Channel Distribution</h3>
      <div className="flex-1 relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={75}
              outerRadius={95}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
           <span className="text-[28px] font-extrabold text-primary leading-none">100%</span>
           <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Total Reach</span>
        </div>
      </div>
      {/* Legend below stacked */}
      <div className="flex flex-col gap-4 mt-6 px-4">
         {data.map(d => (
           <div key={d.name} className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row items-center gap-3">
                 <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></span>
                 <span className="text-[13px] text-gray-700 font-medium">{d.name}</span>
              </div>
              <span className="text-[13px] font-bold text-gray-900">{d.value}%</span>
           </div>
         ))}
      </div>
    </div>
  );
}
