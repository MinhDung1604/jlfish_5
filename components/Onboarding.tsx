import React, { useState } from 'react';
import { JellyfishLogo, ArrowRight } from './Icons';
import { UserProfile, DriftTime } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [slide, setSlide] = useState(1);
  const [name, setName] = useState('');
  const [jellyfishName, setJellyfishName] = useState('');
  const [driftTime, setDriftTime] = useState<DriftTime>('Evening');

  const handleNext = () => setSlide(prev => prev + 1);

  const handleFinish = () => {
    if (name && jellyfishName) {
      onComplete({
        name,
        jellyfishName,
        preferredDriftTime: driftTime,
        isOnboarded: true,
        xp: 0,
        level: 1
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 relative overflow-hidden transition-all duration-500 min-h-[550px] flex flex-col">
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${slide === i ? 'bg-teal-400 w-6' : 'bg-white/20'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          
          {/* Slide 1: Welcome */}
          {slide === 1 && (
            <>
              <div className="mb-8 p-6 bg-teal-500/10 rounded-full animate-float">
                <JellyfishLogo className="w-24 h-24 text-teal-300" />
              </div>
              <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-blue-200">
                Hi. I'm here to drift with you.
              </h1>
              <p className="text-blue-200/80 leading-relaxed mb-12">
                A gentle space to notice your patterns before they become burnout.
              </p>
              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {/* Slide 2: Purpose */}
          {slide === 2 && (
            <>
              <div className="absolute top-4 left-4 opacity-50">
                <JellyfishLogo className="w-8 h-8 text-teal-300" />
              </div>
              <h2 className="text-2xl font-bold mb-6 text-white">Burnout builds quietly.</h2>
              <p className="text-lg text-blue-200 leading-relaxed mb-6">
                Sleep slips, stress accumulates, days blur together.
              </p>
              <p className="text-lg text-white font-medium mb-12">
                I'm here to help you notice the patterns before they notice you.
              </p>
              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Next</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

           {/* Slide 3: Time Preference */}
           {slide === 3 && (
            <>
              <div className="absolute top-4 left-4 opacity-50">
                <JellyfishLogo className="w-8 h-8 text-teal-300" />
              </div>
              <h2 className="text-2xl font-bold mb-8 text-white">When is best to check in?</h2>
              
              <div className="w-full space-y-3 mb-10 text-left">
                  {['Morning', 'Afternoon', 'Evening'].map((time) => (
                      <button 
                        key={time}
                        onClick={() => setDriftTime(time as DriftTime)}
                        className={`w-full p-4 rounded-xl border transition-all flex justify-between items-center ${
                            driftTime === time 
                            ? 'bg-teal-500/20 border-teal-500 text-white' 
                            : 'bg-white/5 border-white/10 text-blue-200 hover:bg-white/10'
                        }`}
                      >
                          <span>{time} Drift</span>
                          {driftTime === time && <div className="w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />}
                      </button>
                  ))}
              </div>

              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Next</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {/* Slide 4: Naming */}
          {slide === 4 && (
            <div className="w-full text-left">
              <div className="flex justify-center mb-8">
                 <JellyfishLogo className="w-16 h-16 text-teal-300 animate-breathe" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-blue-300 mb-2 ml-1">What should I call you?</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400/50 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-blue-300 mb-2 ml-1">And what would you like to call me?</label>
                  <input 
                    type="text" 
                    value={jellyfishName}
                    onChange={(e) => setJellyfishName(e.target.value)}
                    placeholder="Jellyfish name"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400/50 transition-all"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <button 
                  onClick={handleFinish} 
                  disabled={!name || !jellyfishName}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-teal-900/20 transition-all transform hover:scale-[1.02]"
                >
                  Start Drifting
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};