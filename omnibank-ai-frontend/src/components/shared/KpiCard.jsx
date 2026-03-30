export default function KpiCard({ title, value, subValue, subValueStyle = 'text', highlightColor, label }) {
  const colors = {
    teal: 'bg-teal',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400'
  };
  
  return (
    <div 
      className="glass-card p-6 flex flex-col justify-between h-[150px] relative overflow-hidden transition-all duration-300 hover:neo-shadow group hover:-translate-y-1 cursor-default"
    >
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 mt-3 group-hover:text-indigo-400 transition-colors">{title}</p>
        <div className="flex items-end gap-3">
          <span className="text-[32px] md:text-4xl font-extrabold text-slate-800 tracking-tight leading-none transition-all duration-300">{value}</span>
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
      </div>
      
      {/* Decorative side accent */}
      {highlightColor && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors[highlightColor]} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
      )}
    </div>
  );
}
