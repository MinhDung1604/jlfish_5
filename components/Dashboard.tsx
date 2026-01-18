
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, WeeklyCollectionItem } from '../types';
import { JellyfishLogo, BarChart2, Menu, Plus, Book, MapIcon, MessageSquare, Sun } from './Icons';
import { getJellyfishGreeting } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  logs: DailyLog[];
  collection: WeeklyCollectionItem[];
  onCheckIn: () => void;
  onViewMap: () => void;
  onNavigate: (view: any) => void;
  isTransitioning?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logs, collection, onCheckIn, onViewMap, onNavigate }) => {
  const [greeting, setGreeting] = useState(`Hi, ${user.name}.`);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadGreeting = async () => {
      const text = await getJellyfishGreeting(user, logs);
      if (mounted) setGreeting(text);
    };
    loadGreeting();
    return () => { mounted = false; };
  }, [user, logs.length]); 

  const todayStr = new Date().toDateString();
  const hasCheckedInToday = user.lastCheckInDate === todayStr || (logs.length > 0 && new Date(logs[logs.length-1].date).toDateString() === todayStr);
  
  // Available every 7 logs or logs >= 2 for testing
  const isWeeklyReflectionAvailable = logs.length >= 2;

  const xpForNextLevel = 100;
  const progress = Math.min((user.xp % xpForNextLevel) / xpForNextLevel * 100, 100);
  
  // Dynamic glow based on Level, Daily Check-In, and User Preference
  const glowIntensity = Math.min(30 + (user.level * 10) + (hasCheckedInToday ? 50 : 0), 150);
  const mascotColor = user.preferredColor || "#2dd4bf";

  return (
    <div className="min-h-full flex flex-col relative animate-page-enter">
      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="w-64 bg-[#0a0f1e] border-l border-white/10 p-6 flex flex-col shadow-2xl animate-fade-in">
            <div className="flex justify-end mb-8">
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/50 hover:text-white">✕</button>
            </div>
            <div className="flex items-center gap-3 mb-10 px-2">
               <div className="p-2 bg-white/5 rounded-full">
                <JellyfishLogo className="w-6 h-6" accentColor={mascotColor} level={user.level} isEnergized={hasCheckedInToday} />
               </div>
               <span className="font-bold text-lg tracking-tight">Jellyfish</span>
            </div>
            <nav className="space-y-2">
              <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 font-medium">Home</button>
              <button onClick={() => { onNavigate('patterns'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200">What I've Noticed</button>
              <button onClick={() => { onNavigate('collection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200">My Collection</button>
              <button onClick={() => { onNavigate('reflection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200">Weekly Reflection</button>
              <button onClick={() => { onNavigate('bloom'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200">The Bloom Network</button>
              <div className="h-px bg-white/10 my-2" />
              <button onClick={() => { onNavigate('settings'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200">Settings</button>
            </nav>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 relative z-10">
        <div className="w-10" />
        <div className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">DRIFTING</div>
        <button onClick={() => setIsMenuOpen(true)} className="p-3 text-blue-300 active:scale-90 transition-transform bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Central Drift Area */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8 px-8 py-10">
        <div className="relative mb-10">
          <div 
            className="absolute inset-0 rounded-full animate-pulse transition-all duration-1000" 
            style={{ 
              filter: `blur(${glowIntensity}px)`,
              backgroundColor: mascotColor,
              opacity: hasCheckedInToday ? 0.35 : 0.2
            }} 
          />
          <JellyfishLogo 
            className="w-40 h-40 relative z-10" 
            accentColor={mascotColor}
            level={user.level} 
            isEnergized={hasCheckedInToday}
          />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
             <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: mascotColor }} />
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest whitespace-nowrap opacity-60" style={{ color: mascotColor }}>
             LEVEL {user.level} GROWTH
          </div>
        </div>
        <h1 className="text-2xl font-light text-center text-white/90 leading-relaxed px-4 italic min-h-[4rem]">
          "{greeting}"
        </h1>
      </div>

      {/* Primary Actions Cards */}
      <div className="w-full pb-10 space-y-3 px-6 relative z-10">
        {!hasCheckedInToday ? (
          <button onClick={onCheckIn} className="w-full bg-gradient-to-r from-white/5 to-white/10 active:scale-[0.98] border border-white/10 rounded-3xl p-5 text-left transition-all group shadow-xl">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:scale-110 transition-transform" style={{ color: mascotColor }}><Plus className="w-7 h-7" /></div>
              <div>
                <h3 className="text-xl font-bold text-white">Daily Check-In</h3>
                <p className="text-sm text-blue-200/70">Connect with yourself today.</p>
              </div>
            </div>
          </button>
        ) : (
          <button onClick={onViewMap} className="w-full bg-gradient-to-r from-white/5 to-white/10 active:scale-[0.98] border border-white/10 rounded-3xl p-5 text-left transition-all shadow-xl">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-2xl" style={{ color: mascotColor }}><MapIcon className="w-7 h-7" /></div>
              <div>
                <h3 className="text-xl font-bold text-white">Journey Map</h3>
                <p className="text-sm text-blue-200/70">Reflect on your recent path.</p>
              </div>
            </div>
          </button>
        )}

        <button 
          onClick={() => onNavigate('reflection')}
          disabled={!isWeeklyReflectionAvailable}
          className={`w-full glass-panel active:scale-[0.98] border border-white/5 rounded-3xl p-5 text-left transition-all ${!isWeeklyReflectionAvailable ? 'opacity-50 grayscale' : 'hover:bg-white/10 shadow-lg'}`}
        >
          <div className="flex items-center gap-5">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-300"><Sun className="w-7 h-7" /></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">Weekly Reflection</h3>
              <p className="text-sm text-blue-200/70">
                {isWeeklyReflectionAvailable ? "A character is waiting for you." : "Check back in on Monday."}
              </p>
            </div>
            {isWeeklyReflectionAvailable && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          </div>
        </button>

        <div className="flex gap-3">
            <button onClick={() => onNavigate('patterns')} className="flex-1 glass-panel active:scale-[0.98] rounded-3xl p-5 text-left transition-all group">
                <div className="flex flex-col gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-300 w-fit group-hover:bg-blue-500/30 transition-colors"><BarChart2 className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-white">Patterns</h3>
                        <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Insights</p>
                    </div>
                </div>
            </button>
             <button onClick={() => onNavigate('collection')} className="flex-1 glass-panel active:scale-[0.98] rounded-3xl p-5 text-left transition-all group">
                <div className="flex flex-col gap-4">
                    <div className="p-3 bg-pink-500/20 rounded-2xl text-pink-300 w-fit group-hover:bg-pink-500/30 transition-colors"><Book className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-white">Collection</h3>
                        <p className="text-[10px] uppercase tracking-wider text-pink-400 font-bold">Stickers</p>
                    </div>
                </div>
            </button>
        </div>

        <button onClick={() => onNavigate('chat')} className="w-full glass-panel active:scale-[0.98] border border-white/5 rounded-3xl p-5 text-left transition-all">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-300"><MessageSquare className="w-7 h-7" /></div>
            <div>
              <h3 className="text-xl font-bold text-white">Drift with Jelly</h3>
              <p className="text-sm text-blue-200/70">A space for open thought.</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
