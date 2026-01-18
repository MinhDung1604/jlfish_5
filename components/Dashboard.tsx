import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog } from '../types';
import { JellyfishLogo, BarChart2, Menu, ArrowRight, Plus, Book, MapIcon, Brain, MessageSquare } from './Icons';
import { getJellyfishGreeting } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  logs: DailyLog[];
  onCheckIn: () => void;
  onViewMap: () => void;
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logs, onCheckIn, onViewMap, onNavigate }) => {
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

  const hasRecentLog = logs.length > 0 && new Date(logs[logs.length-1].date).toDateString() === new Date().toDateString();
  const isWeeklyReflectionAvailable = logs.length >= 2;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Calculate XP Progress for visual bar
  const xpForNextLevel = 100; // Fixed for now
  const progress = Math.min((user.xp % xpForNextLevel) / xpForNextLevel * 100, 100);
  
  // Calculate Glow Intensity based on Level
  const glowIntensity = Math.min(20 + (user.level * 10), 80); // Base 20px, max 80px

  return (
    <div className="h-full flex flex-col relative animate-fade-in overflow-hidden">
      
      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={toggleMenu} />
          <div className="w-64 bg-[#0f172a] border-l border-white/10 p-6 flex flex-col shadow-2xl animate-fade-in">
            <div className="flex justify-end mb-8">
               <button onClick={toggleMenu} className="p-2 text-white/50 hover:text-white">✕</button>
            </div>
            
            <div className="flex items-center gap-3 mb-10 px-2">
               <div className="p-2 bg-teal-500/10 rounded-full"><JellyfishLogo className="w-6 h-6 text-teal-300"/></div>
               <span className="font-bold text-lg tracking-tight">Jellyfish</span>
            </div>

            <nav className="space-y-2">
              <button onClick={() => { onNavigate('dashboard'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">Home</button>
              <button onClick={() => { onNavigate('patterns'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">What I've Noticed</button>
              <button onClick={() => { onNavigate('collection'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">My Collection</button>
              <button onClick={() => { onNavigate('reflection'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">Weekly Reflection</button>
              <button onClick={() => { onNavigate('bloom'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">The Bloom Network</button>
              <button onClick={() => { onNavigate('chat'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">Drift with Jelly</button> {/* New chat link */}
              <div className="h-px bg-white/10 my-2" />
              <button onClick={() => { onNavigate('settings'); toggleMenu(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-blue-200 hover:text-white transition-colors">Settings</button>
            </nav>

            <div className="mt-auto text-xs text-center text-white/20 pt-8">
              v1.2.0 • Drifting with you
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 relative z-10">
        {/* Spacer for centering */}
        <div className="w-10" />

        <div className="text-xs font-medium tracking-widest text-teal-300/50 uppercase">JELLYFISH</div>
        
        <button onClick={toggleMenu} className="p-2 text-blue-300 hover:text-white transition-colors bg-white/5 rounded-full backdrop-blur-md">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Central Drift Area */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-10 px-6">
        <div className="relative mb-8 group cursor-pointer" title={`Level ${user.level} (XP: ${user.xp})`}>
          <div 
            className="absolute inset-0 bg-teal-400/20 rounded-full animate-pulse transition-all duration-1000" 
            style={{ filter: `blur(${glowIntensity}px)` }} 
          />
          <JellyfishLogo className="w-32 h-32 text-teal-300 relative z-10 animate-float" />
          
          {/* XP Bar (Subtle) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-teal-500/50 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-teal-300/50 font-mono">
             LVL {user.level}
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-light text-center text-white mb-4 leading-relaxed animate-fade-in">
          "{greeting}"
        </h1>
      </div>

      {/* Primary Actions Cards */}
      <div className="w-full pb-8 space-y-3 px-4 relative z-10">
        
        {/* Check In / Logged State */}
        {!hasRecentLog ? (
          <button 
            onClick={onCheckIn}
            className="w-full bg-gradient-to-r from-teal-500/20 to-blue-600/20 hover:from-teal-500/30 hover:to-blue-600/30 border border-teal-500/30 rounded-2xl p-4 text-left transition-all group shadow-lg shadow-teal-900/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/20 rounded-full text-teal-300 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Daily Check-In</h3>
                <p className="text-sm text-blue-200 opacity-80">Learn a fact & check the water.</p>
              </div>
            </div>
          </button>
        ) : (
          <button 
            onClick={onViewMap}
            className="w-full bg-gradient-to-r from-teal-500/10 to-blue-600/10 hover:from-teal-500/20 hover:to-blue-600/20 border border-white/10 rounded-2xl p-4 text-left transition-all group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-full text-teal-200 group-hover:scale-110 transition-transform">
                <MapIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">View Journey Map</h3>
                <p className="text-sm text-blue-200 opacity-80">See where you've drifted.</p>
              </div>
            </div>
          </button>
        )}

        {/* Weekly Reflection */}
        {isWeeklyReflectionAvailable && (
          <button 
            onClick={() => onNavigate('reflection')}
            className="w-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 rounded-2xl p-4 text-left transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <JellyfishLogo className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-400/20 rounded-full text-indigo-300">
                         <div className="w-6 h-6 flex items-center justify-center font-serif italic text-xl">W</div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Weekly Reflection</h3>
                        <p className="text-sm text-indigo-200 opacity-80">Story of the week & Sticker</p>
                    </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-300 opacity-50 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        )}

        <div className="flex gap-3">
            {/* Patterns */}
            <button 
                onClick={() => onNavigate('patterns')}
                className="flex-1 glass-panel hover:bg-white/10 rounded-2xl p-4 text-left transition-all group"
            >
                <div className="flex flex-col gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full text-blue-300 w-fit">
                        <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Patterns</h3>
                        <p className="text-xs text-blue-200 opacity-80">Observations</p>
                    </div>
                </div>
            </button>

             {/* Collection */}
             <button 
                onClick={() => onNavigate('collection')}
                className="flex-1 glass-panel hover:bg-white/10 rounded-2xl p-4 text-left transition-all group"
            >
                <div className="flex flex-col gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-full text-pink-300 w-fit">
                        <Book className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Collection</h3>
                        <p className="text-xs text-blue-200 opacity-80">Memories</p>
                    </div>
                </div>
            </button>
        </div>
        
        {/* Chat with Jelly */}
        <button 
          onClick={() => onNavigate('chat')}
          className="w-full bg-gradient-to-r from-purple-500/20 to-indigo-600/20 hover:from-purple-500/30 hover:to-indigo-600/30 border border-purple-500/30 rounded-2xl p-4 text-left transition-all group shadow-lg shadow-purple-900/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-full text-purple-300 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Drift with Jelly</h3>
              <p className="text-sm text-blue-200 opacity-80">Talk about what's on your mind.</p>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
};