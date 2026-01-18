import React, { useState } from 'react';
import { JellyfishLogo, ArrowLeft, Send } from './Icons';
import { UserProfile } from '../types';

interface TherapistDirectoryProps {
  onBack: () => void;
  user: UserProfile;
}

interface Therapist {
  id: string;
  name: string;
  title: string;
  image: string;
  specialties: string[];
  quote: string;
  bio: string;
}

const THERAPISTS: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Clinical Psychologist, Ph.D.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Anxiety & Panic', 'Burnout'],
    quote: "I help people who feel like they're drowning.",
    bio: "I've worked with hundreds of people who thought they had to handle everything alone. My approach is gentle but direct."
  },
  {
    id: '2',
    name: 'Marcus Williams',
    title: 'LMFT',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Depression', 'Work Stress'],
    quote: "Healing happens in connection.",
    bio: "Specializing in high-pressure careers and the toll they take on personal lives."
  },
  {
    id: '3',
    name: 'Dr. Aisha Patel',
    title: 'Psychiatrist, MD',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Trauma', 'Cultural Issues'],
    quote: "Your story matters.",
    bio: "Integrating medical expertise with deep, narrative therapy to address the root causes of distress."
  }
];

export const TherapistDirectory: React.FC<TherapistDirectoryProps> = ({ onBack, user }) => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // View: Directory
  if (!selectedTherapist) {
    return (
      <div className="h-full flex flex-col animate-fade-in pb-20">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-blue-200" />
          </button>
          <h1 className="text-xl font-semibold">Friends of Jellyfish</h1>
        </div>

        <div className="flex gap-4 mb-8">
            <div className="mt-1">
                <JellyfishLogo className="w-8 h-8 text-teal-300" />
            </div>
            <div className="text-sm text-blue-200 pt-2">
                "These are therapists I trust. They won't judge you. They'll just listen, and help."
            </div>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2">
          {THERAPISTS.map(therapist => (
            <button 
              key={therapist.id}
              onClick={() => setSelectedTherapist(therapist)}
              className="w-full glass-panel p-4 rounded-2xl flex items-center gap-4 text-left hover:bg-white/10 transition-all group"
            >
              <img src={therapist.image} alt={therapist.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
              <div>
                <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">{therapist.name}</h3>
                <p className="text-xs text-blue-300 mb-1 italic">"{therapist.quote}"</p>
                <div className="flex gap-2">
                  {therapist.specialties.map(s => (
                    <span key={s} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-blue-200">{s}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // View: Message Sent Success
  if (messageSent) {
      return (
        <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-6">
            <div className="p-6 bg-teal-500/10 rounded-full mb-6 animate-breathe">
                <JellyfishLogo className="w-20 h-20 text-teal-300" />
            </div>
            <h2 className="text-2xl font-bold mb-4">You did it.</h2>
            <p className="text-blue-200 mb-8 max-w-xs">
                I know that took courage. {selectedTherapist.name} will get your message soon. I'm proud of you.
            </p>
            <button 
                onClick={onBack}
                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
            >
                Back to Dashboard
            </button>
        </div>
      );
  }

  // View: Messaging Form
  if (isMessaging) {
      return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setIsMessaging(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-blue-200" />
                </button>
                <h1 className="text-xl font-semibold">Message {selectedTherapist.name.split(' ')[1]}</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <JellyfishLogo className="w-8 h-8 text-teal-300 shrink-0" />
                <p className="text-sm text-blue-200 pt-1">
                    I'll help you write this. You can edit it however you want.
                </p>
            </div>

            <div className="flex-1">
                <textarea 
                    className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-6 text-white leading-relaxed focus:outline-none focus:border-teal-500/50 transition-all resize-none"
                    defaultValue={`Hi ${selectedTherapist.name},\n\nI've been struggling with burnout and my Jellyfish companion suggested I reach out.\n\nI'd like to learn more about working together.\n\nBest,\n${user.name}`}
                />
            </div>

            <div className="mt-4 space-y-3 pb-8">
                <button 
                    onClick={() => setMessageSent(true)}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                >
                    <Send className="w-5 h-5" /> Send Message
                </button>
                <button 
                    onClick={() => setIsMessaging(false)}
                    className="w-full py-4 text-blue-300 hover:text-white"
                >
                    Cancel
                </button>
            </div>
        </div>
      );
  }

  // View: Profile
  return (
    <div className="h-full flex flex-col animate-fade-in pb-20 overflow-y-auto">
       <button onClick={() => setSelectedTherapist(null)} className="absolute top-6 left-4 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
       
       <div className="relative h-64 w-full shrink-0">
          <img src={selectedTherapist.image} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
          <div className="absolute bottom-4 left-6">
              <h2 className="text-3xl font-bold">{selectedTherapist.name}</h2>
              <p className="text-blue-300">{selectedTherapist.title}</p>
          </div>
       </div>

       <div className="p-6 space-y-8">
          <div>
              <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">About Me</h3>
              <p className="text-blue-100 leading-relaxed">"{selectedTherapist.bio}"</p>
          </div>

          <div>
              <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                  {selectedTherapist.specialties.map(s => (
                      <span key={s} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm">{s}</span>
                  ))}
              </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl flex gap-4">
              <JellyfishLogo className="w-8 h-8 text-teal-300 shrink-0" />
              <p className="text-sm text-teal-100 italic">
                  "{selectedTherapist.name.split(' ')[1]} is one of my most trusted friends. She'll take good care of you."
              </p>
          </div>

          <button 
            onClick={() => setIsMessaging(true)}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition-all"
          >
              Send a message
          </button>
       </div>
    </div>
  );
};