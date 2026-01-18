import React, { useState, useEffect } from 'react';
import { DailyLog, UserProfile, WeeklyCollectionItem } from '../types';
import { JellyfishLogo, ArrowRight, ArrowLeft, Egg } from './Icons';
import { getWeeklyReflection, WeeklyReflectionResult } from '../services/geminiService';
import { Sticker } from './Sticker';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface WeeklyReflectionProps {
  user: UserProfile;
  logs: DailyLog[];
  onClose: () => void;
  onNavigateToBloom: () => void; // Renamed prop
  onSaveSticker: (item: WeeklyCollectionItem) => void;
}

export const WeeklyReflection: React.FC<WeeklyReflectionProps> = ({ user, onClose, onNavigateToBloom, logs, onSaveSticker }) => {
  const [data, setData] = useState<WeeklyReflectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0: Story/Charts, 1: Suggestions, 2: Hatch Egg, 3: Reveal Sticker
  const [isCracking, setIsCracking] = useState(false);
  const [isHatched, setIsHatched] = useState(false);

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

  const handleHatch = () => {
      setIsCracking(true);
      setTimeout(() => {
          setIsHatched(true);
      }, 500); // Visual crack appears quickly
      setTimeout(() => {
          setStep(3); // Then transition to next step after animation
      }, 1500); // Total animation time including fade
  };

  const weeklyChartData = logs.slice(-7).map(l => ({ score: l.totalScore }));

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <JellyfishLogo className="w-16 h-16 text-teal-300 animate-breathe mb-4" />
        <div className="text-blue-300 animate-pulse">Gathering thoughts from the deep...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
        <div className="p-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-blue-100">Weekly Reflection</h1>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-blue-300"><ArrowLeft className="w-4 h-4" /></button>
        </div>

        {/* Step 0: Story & Charts */}
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
                    <button onClick={() => setStep(1)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2">
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

        {/* Step 1: Suggestions */}
        {step === 1 && (
             <div className="flex-1 p-6 flex flex-col animate-fade-in">
                 <h2 className="text-2xl font-light text-white mb-8">Things to try</h2>
                 
                 <div className="space-y-4 mb-8">
                     {data.suggestions.map((s, i) => (
                         <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 items-start">
                             <div className="text-teal-400 font-bold text-xl">{i+1}</div>
                             <p className="text-blue-100 pt-1">{s}</p>
                         </div>
                     ))}
                 </div>

                 {data.isHighRisk && (
                     <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl mb-4 text-center">
                         <p className="text-indigo-200 text-sm mb-3">You've been carrying a lot. Sometimes a trusted guide can help.</p>
                         <button onClick={onNavigateToBloom} className="text-indigo-300 underline text-sm">Connect with the Bloom</button>
                     </div>
                 )}

                 <div className="mt-auto">
                    <button onClick={() => setStep(2)} className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                        Reveal Your Character <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
             </div>
        )}

        {/* Step 2: Hatch Egg */}
        {step === 2 && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center animate-fade-in relative">
                <h3 className="text-blue-300 uppercase tracking-widest text-xs mb-12">Something new is here</h3>
                
                <button 
                    onClick={handleHatch}
                    disabled={isCracking}
                    className={`relative w-40 h-40 flex items-center justify-center transition-transform duration-300 ${isCracking ? 'animate-shake' : 'hover:scale-105'}`}
                >
                    <div className={`transition-all duration-500 ${isHatched ? 'opacity-0 scale-150 blur-xl' : 'opacity-100'}`}>
                        <Egg className="w-32 h-32 text-teal-200" />
                    </div>
                    {/* Cracks effect - can be more sophisticated with SVG masks or multiple images */}
                    {isCracking && !isHatched && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 border-t-2 border-l-2 border-white/50 rounded-full animate-spin-slow opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationDuration: '0.8s' }} />
                        </div>
                    )}
                </button>
                
                <p className="mt-8 text-blue-200 animate-pulse">
                    {isCracking ? (isHatched ? "" : "Cracking...") : "Tap to hatch"}
                </p>
            </div>
        )}

        {/* Step 3: Sticker Reveal */}
        {step === 3 && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
                
                <h3 className="text-blue-300 uppercase tracking-widest text-xs mb-8">Character of the Week</h3>
                
                <div className="relative mb-8">
                     <div className="absolute inset-0 bg-white/10 blur-[50px] rounded-full" style={{ backgroundColor: data.sticker.color, opacity: 0.2 }} />
                     <Sticker archetype={data.sticker.archetype} color={data.sticker.color} className="w-40 h-40 relative z-10 animate-float" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{data.sticker.name}</h2>
                <p className="text-blue-200 max-w-xs mx-auto mb-12 italic">"{data.sticker.reason}"</p>

                <div className="w-full space-y-3">
                     <button onClick={handleFinish} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold">
                        Collect & Finish
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};