import { MoreHorizontal } from 'lucide-react';

export default function IntentBreakdown() {
  const data = [
    { name: 'Loan Inquiry', value: 64, color: '#1A2B4A' },
    { name: 'Balance Check', value: 22, color: '#E2E8F0' },
    { name: 'Grievance', value: 9, color: '#F87171' },
    { name: 'General Query', value: 5, color: '#BAE6FD' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[15px] font-bold text-gray-900 tracking-wide">Intent Breakdown</h3>
        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
      </div>
      <div className="flex flex-col gap-6 flex-1 justify-center">
        {data.map(item => (
          <div key={item.name}>
            <div className="flex justify-between mb-2">
              <span className="text-[12px] font-bold text-gray-800">{item.name}</span>
              <span className="text-[12px] font-extrabold text-primary">{item.value}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full rounded-full shadow-sm transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
