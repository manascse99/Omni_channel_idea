import React from 'react';
import { Bot, Zap, Brain, Sliders, GitBranch, ToggleRight } from 'lucide-react';


export default function AiConfigSection({ settings, onUpdate }) {
  const { autoReply, autoEscalate, sentimentAnalysis, confidenceThreshold, model, intents: localIntents } = settings;

  const setLocalIntents = (newIntents) => onUpdate({ intents: typeof newIntents === 'function' ? newIntents(localIntents) : newIntents });
  const setAutoReply = (val) => onUpdate({ autoReply: val });
  const setAutoEscalate = (val) => onUpdate({ autoEscalate: val });
  const setSentiment = (val) => onUpdate({ sentimentAnalysis: val });
  const setThreshold = (val) => onUpdate({ confidenceThreshold: val });
  const setModel = (val) => onUpdate({ model: val });

  const Toggle = ({ val, onChange }) => (
    <button
      onClick={() => onChange(!val)}
      className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${val ? 'bg-teal' : 'bg-gray-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${val ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* AI Model Selection */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-teal/10 rounded-xl flex items-center justify-center text-teal"><Brain size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">AI Model</h3>
            <p className="text-[11px] text-gray-400 font-medium">Select the AI engine powering OMNI</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'llama3', label: 'Llama 3 (Local)', desc: 'Privacy-focused local AI', badge: 'Recommended' },
            { id: 'mistral', label: 'Mistral (Local)', desc: 'Highly efficient model', badge: '' },
            { id: 'custom', label: 'Custom Model', desc: 'Your fine-tune', badge: 'Enterprise' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${model === m.id ? 'border-teal bg-teal/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
            >
              {m.badge && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 block w-fit ${m.badge === 'Recommended' ? 'bg-teal/20 text-teal' : 'bg-amber-100 text-amber-600'}`}>{m.badge}</span>
              )}
              <p className="text-[13px] font-black text-primary">{m.label}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-teal/10 rounded-xl flex items-center justify-center text-teal"><ToggleRight size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">AI Behaviour</h3>
            <p className="text-[11px] text-gray-400 font-medium">Control how the AI engages with customers</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Global AI Auto-Reply', desc: 'AI responds automatically to common queries', val: autoReply, set: setAutoReply },
            { label: 'Auto-Escalate to Human', desc: 'Hand off when confidence drops below threshold', val: autoEscalate, set: setAutoEscalate },
            { label: 'Sentiment Analysis', desc: 'Detect customer emotion in real time', val: sentimentAnalysis, set: setSentiment },
          ].map(({ label, desc, val, set }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[13px] font-bold text-primary">{label}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
              </div>
              <Toggle val={val} onChange={set} />
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Threshold */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-teal/10 rounded-xl flex items-center justify-center text-teal"><Sliders size={18} /></div>
          <div className="flex-1">
            <h3 className="text-[15px] font-black text-primary">Confidence Threshold</h3>
            <p className="text-[11px] text-gray-400 font-medium">AI replies only when confidence exceeds this value</p>
          </div>
          <div className="bg-primary text-teal text-[14px] font-black px-4 py-1.5 rounded-xl">{confidenceThreshold}%</div>
        </div>
        <input
          type="range" min="50" max="100" value={confidenceThreshold}
          onChange={e => setThreshold(+e.target.value)}
          className="w-full accent-teal h-2 rounded-full"
        />
        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Cautious (50%)</span><span>Strict (100%)</span>
        </div>
      </div>

      {/* Intent Mapping */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-teal/10 rounded-xl flex items-center justify-center text-teal"><GitBranch size={18} /></div>
          <div>
            <h3 className="text-[15px] font-black text-primary">Intent Mapping</h3>
            <p className="text-[11px] text-gray-400 font-medium">Map customer intents to AI modules</p>
          </div>
        </div>
        <div className="space-y-2">
          {localIntents.length > 0 ? localIntents.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-teal' : 'bg-gray-300'}`} />
                <span className="text-[13px] font-bold text-primary">{item.intent}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">{item.module}</span>
                <button
                  onClick={() => setLocalIntents(prev => prev.map((x, j) => j === i ? { ...x, active: !x.active } : x))}
                  className={`w-9 h-5 rounded-full relative transition-colors flex items-center px-0.5 ${item.active ? 'bg-teal' : 'bg-gray-200'}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">No custom intents mapped</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
