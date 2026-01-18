
import React from 'react';
import { ArrowLeft, JellyfishLogo } from './Icons';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onBack: () => void;
  onReset: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

const COLOR_PRESETS = [
  { name: 'Calm Teal', value: '#2dd4bf' },
  { name: 'Soft Rose', value: '#fb7185' },
  { name: 'Bright Gold', value: '#fbbf24' },
  { name: 'Deep Violet', value: '#a78bfa' },
  { name: 'Crystal Blue', value: '#60a5fa' },
];

export const Settings: React.FC<SettingsProps> = ({ user, onBack, onReset, onUpdateUser }) => {
  const handleTimeChange = (time: string) => {
      onUpdateUser({ ...user, preferredDriftTime: time });
  };

  const handleColorChange = (color: string) => {
      onUpdateUser({ ...user, preferredColor: color });
  };

  const handleNameChange = (newName: string) => {
      onUpdateUser({ ...user, jellyfishName: newName });
  };

  const mascotColor = user.preferredColor || '#2dd4bf';

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-4 mb-8 p-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-blue-200" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="space-y-8 overflow-y-auto pb-10 px-4 pr-2">
        <section>
          <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-4">Personality</h3>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-white/5 rounded-full shrink-0">
                <JellyfishLogo className="w-8 h-8" accentColor={mascotColor} level={user.level} />
            </div>
            <div className="flex-1">
                <label className="text-[10px] text-blue-400 uppercase font-bold block mb-1">Companion Name</label>
                <input 
                    type="text"
                    value={user.jellyfishName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Name your friend..."
                    className="w-full bg-transparent border-none text-white font-medium focus:ring-0 p-0 placeholder-white/20"
                    style={{ color: mascotColor }}
                />
            </div>
          </div>
        </section>

        <section>
            <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-4">Appearance</h3>
            <div className="glass-panel rounded-xl p-6">
                <label className="text-sm text-blue-200 block mb-4">Glow Color</label>
                <div className="flex flex-wrap gap-4">
                    {COLOR_PRESETS.map((color) => (
                        <button 
                            key={color.value}
                            onClick={() => handleColorChange(color.value)}
                            className={`w-12 h-12 rounded-full border-4 transition-all ${user.preferredColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:border-white/40'}`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>
        </section>

        <section>
            <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-4">Daily Drift</h3>
            <div className="glass-panel rounded-xl p-6">
                <label className="text-sm text-blue-200 block mb-4">Preferred Check-In Time</label>
                <input 
                    type="time" 
                    value={user.preferredDriftTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold text-center transition-all focus:outline-none focus:border-white/30"
                    style={{ color: mascotColor }}
                />
                <p className="text-[10px] text-blue-400/50 mt-4 text-center italic">
                    If you check in before 12:00 PM, I'll ask about yesterday.
                </p>
            </div>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-4">Privacy & Data</h3>
          <div className="glass-panel rounded-xl overflow-hidden">
             <button className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 text-sm">View stored data</button>
             <button className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 text-sm">Export my data</button>
             <button onClick={onReset} className="w-full text-left p-4 hover:bg-red-500/10 text-red-300 text-sm">Delete all data & Reset</button>
          </div>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-4">Crisis Resources</h3>
          <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-xl space-y-3">
             <p className="text-sm font-semibold text-white">If you are in crisis:</p>
             <div className="flex justify-between items-center text-sm"><span>Crisis Text Line</span><span className="font-mono bg-red-500/20 px-2 py-1 rounded">Text HOME to 741741</span></div>
             <div className="flex justify-between items-center text-sm"><span>Suicide Prevention</span><span className="font-mono bg-red-500/20 px-2 py-1 rounded">Call 988</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};
