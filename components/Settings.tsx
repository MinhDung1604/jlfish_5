import React from 'react';
import { ArrowLeft, JellyfishLogo } from './Icons';
import { UserProfile, DriftTime } from '../types';

interface SettingsProps {
  user: UserProfile;
  onBack: () => void;
  onReset: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onBack, onReset, onUpdateUser }) => {
  
  const handleTimeChange = (time: DriftTime) => {
      onUpdateUser({ ...user, preferredDriftTime: time });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-blue-200" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="space-y-8 overflow-y-auto pb-10 pr-2">
        <section>
          <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-4">Personality</h3>
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <JellyfishLogo className="w-6 h-6 text-teal-300" />
              <span>{user.jellyfishName}</span>
            </div>
            <span className="text-xs text-blue-400">Occasionally (Default)</span>
          </div>
        </section>

        <section>
            <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-4">Preferences</h3>
            <div className="glass-panel rounded-xl p-4">
                <label className="text-sm text-blue-200 block mb-3">Preferred Drift Time</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Morning', 'Afternoon', 'Evening'].map((time) => (
                        <button
                            key={time}
                            onClick={() => handleTimeChange(time as DriftTime)}
                            className={`text-sm py-2 rounded-lg transition-colors ${
                                user.preferredDriftTime === time 
                                ? 'bg-teal-500/30 text-white border border-teal-500/50' 
                                : 'bg-black/20 text-blue-300 hover:bg-white/5'
                            }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
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
             <div className="flex justify-between items-center text-sm">
                <span>Crisis Text Line</span>
                <span className="font-mono bg-red-500/20 px-2 py-1 rounded">Text HOME to 741741</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span>Suicide Prevention</span>
                <span className="font-mono bg-red-500/20 px-2 py-1 rounded">Call 988</span>
             </div>
          </div>
        </section>

        <div className="text-center text-xs text-blue-500 pt-8">
            Jellyfish v1.2 • Privacy Policy
        </div>
      </div>
    </div>
  );
};