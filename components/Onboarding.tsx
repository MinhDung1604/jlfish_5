
import React, { useState } from 'react';
import { JellyfishLogo, ArrowRight } from './Icons';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const COLOR_PRESETS = [
  { name: 'Calm Teal', value: '#2dd4bf' },
  { name: 'Soft Rose', value: '#fb7185' },
  { name: 'Bright Gold', value: '#fbbf24' },
  { name: 'Deep Violet', value: '#a78bfa' },
  { name: 'Crystal Blue', value: '#60a5fa' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [slide, setSlide] = useState(1);
  const [name, setName] = useState('');
  const [jellyfishName, setJellyfishName] = useState('');
  const [driftTime, setDriftTime] = useState('20:00');
  const [preferredColor, setPreferredColor] = useState('#2dd4bf');

  const handleNext = () => setSlide(prev => prev + 1);

  const handleFinish = () => {
    if (name && jellyfishName) {
      onComplete({
        name,
        jellyfishName,
        preferredDriftTime: driftTime,
        preferredColor: preferredColor,
        isOnboarded: true,
        xp: 0,
        level: 1
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 relative overflow-hidden transition-all duration-500 min-h-[550px] flex flex-col">
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${slide === i ? 'bg-teal-400 w-6' : 'bg-white/20'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          {slide === 1 && (
            <>
              <div className="mb-8 p-6 bg-white/5 rounded-full animate-float">
                <JellyfishLogo className="w-24 h-24" accentColor={preferredColor} />
              </div>
              <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-blue-200">Hi. I'm here to drift with you.</h1>
              <p className="text-blue-200/80 mb-12">A gentle space to notice your patterns before they become burnout.</p>
              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Continue</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {slide === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-white">Choose your glow.</h2>
              <p className="text-blue-200/80 mb-10">What color feels most like a companion today?</p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {COLOR_PRESETS.map((color) => (
                    <button 
                        key={color.value}
                        onClick={() => setPreferredColor(color.value)}
                        className={`w-14 h-14 rounded-full border-4 transition-all ${preferredColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:border-white/40'}`}
                        style={{ backgroundColor: color.value }}
                    />
                ))}
              </div>
              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Next</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {slide === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-white">Burnout builds quietly.</h2>
              <p className="text-lg text-blue-200 mb-12 leading-relaxed">I'm here to help you notice the patterns before they notice you.</p>
              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Next</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

           {slide === 4 && (
            <>
              <h2 className="text-2xl font-bold mb-8 text-white">When should we check in?</h2>
              <div className="w-full mb-10">
                  <input 
                    type="time" 
                    value={driftTime}
                    onChange={(e) => setDriftTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-6 text-3xl font-bold text-center focus:outline-none focus:border-teal-500 transition-all"
                    style={{ color: preferredColor }}
                  />
                  <p className="text-sm text-blue-300 mt-4">I'll send a soft glow your way at this time each day.</p>
              </div>
              <button onClick={handleNext} className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <span>Next</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {slide === 5 && (
            <div className="w-full text-left">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-blue-300 mb-2">What should I call you?</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-sm text-blue-300 mb-2">And what would you like to call me?</label>
                  <input type="text" value={jellyfishName} onChange={(e) => setJellyfishName(e.target.value)} placeholder="Jellyfish name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button 
                onClick={handleFinish} 
                disabled={!name || !jellyfishName} 
                className="w-full mt-12 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ backgroundColor: preferredColor }}
              >
                Start Drifting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
