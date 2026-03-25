import React from 'react';

export default function SettingsSideNav() {
  const items = [
    { name: 'General', active: true },
    { name: 'AI Configuration', active: false },
    { name: 'Channels', active: false },
    { name: 'Security', active: false },
    { name: 'Team Roles', active: false },
    { name: 'Webhooks', active: false },
  ];

  return (
    <div className="w-[200px] shrink-0 flex flex-col gap-1">
      {items.map((item) => (
        <button
          key={item.name}
          className={`text-left px-6 py-3 rounded-xl text-[13px] font-bold transition-all ${
            item.active
              ? 'bg-white text-primary shadow-sm border border-gray-100'
              : 'text-gray-500 hover:text-primary hover:bg-white/50'
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
