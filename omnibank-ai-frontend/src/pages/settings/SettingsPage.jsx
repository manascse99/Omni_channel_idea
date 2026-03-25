import React from 'react';
import SettingsSideNav from '../../components/settings/SettingsSideNav';
import AiConfigSection from '../../components/settings/AiConfigSection';
import ChannelConfigSection from '../../components/settings/ChannelConfigSection';
import SecuritySection from '../../components/settings/SecuritySection';
import BrandingSection from '../../components/settings/BrandingSection';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="mb-10">
        <h2 className="text-[32px] font-black text-primary tracking-tight leading-none mb-2">Platform Settings</h2>
        <p className="text-[14px] text-gray-500 font-medium tracking-tight">Manage your omnichannel AI engine and security protocols.</p>
      </div>

      <div className="flex gap-10 flex-1 overflow-hidden pb-10">
        <SettingsSideNav />
        
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <AiConfigSection />
          <ChannelConfigSection />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SecuritySection />
            <BrandingSection />
          </div>

          <div className="mt-12 mb-8 flex items-center justify-end gap-6 border-t border-gray-100 pt-8">
             <button className="text-[14px] font-bold text-gray-400 hover:text-primary transition-colors">
                Discard Changes
             </button>
             <button className="bg-teal hover:bg-[#00b395] text-primary font-black px-10 py-4 rounded-2xl text-[14px] flex items-center gap-2 shadow-lg shadow-teal/20 transition-all hover:scale-[1.02]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                   <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                   <polyline points="17 21 17 13 7 13 7 21"></polyline>
                   <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Configuration
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
