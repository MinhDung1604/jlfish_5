
import React, { useState, useEffect } from 'react';
import { DailyLog, UserProfile, WeeklyCollectionItem } from '../types';
import { JellyfishLogo, ArrowRight, ArrowLeft } from './Icons';
import { getWeeklyReflection, WeeklyReflectionResult } from '../services/geminiService';
import { Sticker } from './Sticker';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface WeeklyReflectionProps {
  user: UserProfile;
  logs: DailyLog[];
  onClose: () => void;
  onNavigateToBloom: () => void;
  onSaveSticker: (item: WeeklyCollectionItem) => void;
  isTransitioning?: boolean;
}

const AnimatedEgg = ({ onHatch, isHatching }: { onHatch: () => void, isHatching: boolean }) => {
  const [crackStage, setCrackStage] = useState(0);

  const handleClick = () => {
    if (isHatching) return;
    if (crackStage < 2) {
      setCrackStage(prev => prev + 1);
    } else {
      setCrackStage(3);
      onHatch();
    }
  };

  return (
    <div 
      className={`relative w-64 h-80 flex items-center justify-center cursor-pointer transition-all duration-75 ${crackStage > 0 && !isHatching ? 'active:scale-95' : ''}`} 
      onClick={handleClick}
    >
      <div className={`absolute inset-0 bg-teal-400/20 blur-[80px] rounded-full transition-all duration-1000 ${isHatching ? 'scale-150 opacity-100' : 'scale-75 opacity-40'}`} />
      
      <div className={`relative w-full h-full flex items-center justify-center ${crackStage > 0 && !isHatching ? 'animate-bounce' : ''}`}>
        {/* Top Half (Pointy part of egg) */}
        <div 
          className="absolute w-40 h-32 z-20 transition-all duration-1000 ease-in-out"
          style={{ 
            transform: isHatching ? 'translateY(-150vh) rotate(-20deg)' : 'translateY(-20px)',
            opacity: isHatching ? 0 : 1
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white/90 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <path d="M50 10 C30 10 15 45 15 75 L30 65 L45 77 L60 63 L75 75 L85 75 C85 45 70 10 50 10 Z" />
            {crackStage >= 1 && <path d="M50 15 L45 30 L55 40" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />}
            {crackStage >= 2 && <path d="M30 45 L40 55" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />}
          </svg>
        </div>

        {/* Bottom Half (Rounded part of egg) */}
        <div 
          className="absolute w-40 h-32 z-20 transition-all duration-1000 ease-in-out"
          style={{ 
            transform: isHatching ? 'translateY(150vh) rotate(20deg)' : 'translateY(35px)',
            opacity: isHatching ? 0 : 1
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white/90 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <path d="M15 25 L30 15 L45 27 L60 13 L75 25 L85 25 C85 55 70 85 50 85 C30 85 15 55 15 25 Z" />
            {crackStage >= 3 && <path d="M50 65 L55 75 L45 85" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />}
          </svg>
        </div>
      </div>

      {!isHatching && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
           <p className="text-[10px] font-bold tracking-widest text-teal-300/80 animate-pulse bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm mt-64">
             {crackStage === 0 ? 'TAP TO START' : crackStage < 3 ? 'CRACK IT...' : 'HATCHING!'}
           </p>
        </div>
      )}
    </div>
  );
};

export const WeeklyReflection: React.FC<WeeklyReflectionProps> = ({ user, onClose, onNavigateToBloom, logs, onSaveSticker }) => {
  const [data, setData] = useState<WeeklyReflectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); 
  const [isHatching, setIsHatching] = useState(false);

  useEffect(() => {
    const fetchReflection = async () => {
      const result = await getWeeklyReflection(user, logs);
      setData(result);
      setLoading(false);
    };
    fetchReflection();
  }, [user, logs]);

  const handleFinish = () => {
      if (data) {
          const newItem: WeeklyCollectionItem = {
              id: crypto.randomUUID(),
              weekStartDate: new Date().toISOString(),
              story: data.story,
              sticker: data.sticker
          };
          onSaveSticker(newItem);
      }
      onClose();
  };

  const handleHatchStart = () => {
      if (isHatching) return;
      setIsHatching(true);
      setTimeout(() => setStep(3), 1500);
  };

  const weeklyChartData = logs.slice(-7).map(l => ({ score: l.totalScore }));

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <JellyfishLogo className="w-16 h-16 text-teal-300 animate-breathe mb-4" level={user.level} />
        <div className="text-blue-300 animate-pulse">Gathering thoughts from the deep...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
        <div className="p-4 flex items-center justify-between z-50">
            <h1 className="text-lg font-semibold text-blue-100">Weekly Reflection</h1>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-blue-300"><ArrowLeft className="w-4 h-4" /></button>
        </div>

        {step === 0 && (
            <div className="flex-1 p-6 flex flex-col animate-fade-in">
                <div className="mb-8">
                     <h2 className="text-2xl font-light text-white mb-6">Story of the Week</h2>
                     <p className="text-lg text-blue-100 leading-relaxed font-light">"{data.story}"</p>
                </div>
                <div className="glass-panel p-4 rounded-xl mb-6">
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyChartData}>
                                <Area type="monotone" dataKey="score" stroke="#2dd4bf" fill="rgba(45, 212, 191, 0.2)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-xs text-blue-400 mt-2">Your flow this week</p>
                </div>
                <div className="mt-auto">
                    <button onClick={() => setStep(1)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

        {step === 1 && (
             <div className="flex-1 p-6 flex flex-col animate-fade-in">
                 <h2 className="text-2xl font-light text-white mb-8">Things to try</h2>
                 <div className="space-y-4 mb-8 overflow-y-auto">
                     {data.suggestions.map((s, i) => (
                         <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 items-start">
                             <div className="text-teal-400 font-bold text-xl">{i+1}</div>
                             <p className="text-blue-100 pt-1 text-sm">{s}</p>
                         </div>
                     ))}
                 </div>
                 <div className="mt-auto space-y-4">
                    <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl text-center">
                        <p className="text-indigo-200 text-xs mb-3">I can introduce you to some of my friends if you'd like to dive deeper into these feelings.</p>
                        <button onClick={onNavigateToBloom} className="text-indigo-300 underline text-sm font-semibold">Connect with Bloom Guides</button>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                        Reveal Your Character <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
             </div>
        )}

        {step === 2 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in px-6">
                <div className="mb-12 relative z-50">
                    <h3 className="text-blue-300 uppercase tracking-widest text-xs font-bold mb-2">Something new is drifting here</h3>
                    <p className="text-[10px] text-blue-400 opacity-60">Tap the egg to hatch your weekly companion</p>
                </div>
                
                <AnimatedEgg onHatch={handleHatchStart} isHatching={isHatching} />
                
                <p className={`mt-12 text-blue-200 transition-opacity duration-500 ${isHatching ? 'opacity-0' : 'opacity-100 animate-pulse'}`}>
                    One egg appears every Monday...
                </p>
            </div>
        )}

        {step === 3 && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
                <h3 className="text-blue-300 uppercase tracking-widest text-[10px] font-bold mb-8">Character of the Week</h3>
                <div className="relative mb-8 scale-125 animate-float">
                     <div className="absolute inset-0 blur-[50px] rounded-full opacity-40 animate-pulse" style={{ backgroundColor: data.sticker.color }} />
                     <Sticker archetype={data.sticker.archetype} color={data.sticker.color} className="w-40 h-40 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{data.sticker.name}</h2>
                <p className="text-blue-200 max-w-xs mx-auto mb-12 italic leading-relaxed text-sm">"{data.sticker.reason}"</p>
                <div className="w-full space-y-3">
                     <button onClick={handleFinish} className="w-full py-4 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-xl font-bold text-white transition-all shadow-md">
                        Collect & Finish
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
