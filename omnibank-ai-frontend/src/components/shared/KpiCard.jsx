export default function KpiCard({ title, value, subValue, subValueStyle = 'text', highlightColor, label }) {
  const colors = {
    teal: 'bg-teal',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400'
  };
  
  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</h3>
      <div className="flex items-end gap-3 mt-2">
        <span className="text-[32px] md:text-4xl font-extrabold text-primary tracking-tight leading-none">{value}</span>
        {subValue && (
          <span className={`${
            subValueStyle === 'pill' 
              ? 'bg-teal/10 text-teal px-2 py-0.5 rounded-full text-[11px] mb-2' 
              : 'text-sm text-teal mb-1'
          } font-bold flex items-center gap-1`}>
            {subValue}
          </span>
        )}
      </div>
      {label && <p className="text-[10px] text-teal/80 font-bold uppercase tracking-wider mt-1">{label}</p>}
      
      {/* Decorative side accent */}
      {highlightColor && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors[highlightColor]}`}></div>
      )}
    </div>
  );
}
