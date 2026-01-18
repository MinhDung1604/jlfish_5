import React, { useState } from 'react';
import { JellyfishLogo, ArrowLeft, Send } from './Icons';
import { UserProfile, ChatMessage } from '../types';

export interface BloomGuide { // Exported for use in BloomChat and App
  id: string;
  name: string;
  title: string;
  image: string;
  specialties: string[];
  quote: string;
  bio: string;
}

const BLOOM_GUIDES: BloomGuide[] = [
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

interface BloomConnectionsProps {
  onBack: () => void;
  user: UserProfile;
  onInitiateBloomChat: (guide: BloomGuide, initialMessage: string) => void;
  onContinueBloomChat: (guide: BloomGuide) => void;
}

export const BloomConnections: React.FC<BloomConnectionsProps> = ({ onBack, user, onInitiateBloomChat, onContinueBloomChat }) => {
  const [selectedGuide, setSelectedGuide] = useState<BloomGuide | null>(null);
  const [isComposingMessage, setIsComposingMessage] = useState(false);
  const [composedMessage, setComposedMessage] = useState('');

  // Helper to check if a chat history exists for a guide
  const hasChatHistory = (guideId: string) => {
    const chatHistoryKey = `jellyfish_bloom_chat_history_${guideId}`;
    return localStorage.getItem(chatHistoryKey) !== null;
  };

  // View: Directory
  if (!selectedGuide) {
    return (
      <div className="h-full flex flex-col animate-fade-in pb-20">
        <div className="flex items-center gap-4 mb-6 p-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-blue-200" />
          </button>
          <h1 className="text-xl font-semibold">The Bloom Network</h1>
        </div>

        <div className="flex gap-4 mb-8 p-4">
            <div className="mt-1">
                <JellyfishLogo className="w-8 h-8 text-teal-300" />
            </div>
            <div className="text-sm text-blue-200 pt-2">
                "These are trusted guides from my Bloom, ready to listen and help you float a little easier."
            </div>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 pr-2">
          {BLOOM_GUIDES.map(guide => (
            <button 
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="w-full glass-panel p-4 rounded-2xl flex items-center gap-4 text-left hover:bg-white/10 transition-all group"
            >
              <img src={guide.image} alt={guide.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
              <div>
                <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">{guide.name}</h3>
                <p className="text-xs text-blue-300 mb-1 italic">"{guide.quote}"</p>
                <div className="flex gap-2">
                  {guide.specialties.map(s => (
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

  // View: Composing Message
  if (isComposingMessage) {
      return (
        <div className="h-full flex flex-col animate-fade-in p-4">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setIsComposingMessage(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-blue-200" />
                </button>
                <h1 className="text-xl font-semibold">Connect with {selectedGuide.name.split(' ')[1]}</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <JellyfishLogo className="w-8 h-8 text-teal-300 shrink-0" />
                <p className="text-sm text-blue-200 pt-1">
                    I'll help you start this message. You can edit it however you like.
                </p>
            </div>

            <div className="flex-1">
                <textarea 
                    className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-6 text-white leading-relaxed focus:outline-none focus:border-teal-500/50 transition-all resize-none"
                    defaultValue={`Hi ${selectedGuide.name},\n\nI've been using Jellyfish and wanted to reach out to a Bloom Guide.\n\nI'm looking for support with burnout and would love to learn more about working with you.\n\nBest,\n${user.name}`}
                    onChange={(e) => setComposedMessage(e.target.value)}
                />
            </div>

            <div className="mt-4 space-y-3 pb-8">
                <button 
                    onClick={() => {
                        onInitiateBloomChat(selectedGuide, composedMessage || `Hi ${selectedGuide.name},\n\nI've been using Jellyfish and wanted to reach out to a Bloom Guide.\n\nI'm looking for support with burnout and would love to learn more about working with you.\n\nBest,\n${user.name}`);
                    }}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                >
                    <Send className="w-5 h-5" /> Send Message
                </button>
                <button 
                    onClick={() => setIsComposingMessage(false)}
                    className="w-full py-4 text-blue-300 hover:text-white"
                >
                    Cancel
                </button>
            </div>
        </div>
      );
  }

  // View: Guide Profile
  return (
    <div className="h-full flex flex-col animate-fade-in pb-20 overflow-y-auto">
       <button onClick={() => setSelectedGuide(null)} className="absolute top-6 left-4 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
       
       <div className="relative h-64 w-full shrink-0">
          <img src={selectedGuide.image} alt={selectedGuide.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
          <div className="absolute bottom-4 left-6">
              <h2 className="text-3xl font-bold">{selectedGuide.name}</h2>
              <p className="text-blue-300">{selectedGuide.title}</p>
          </div>
       </div>

       <div className="p-6 space-y-8">
          <div>
              <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">About This Guide</h3>
              <p className="text-blue-100 leading-relaxed">"{selectedGuide.bio}"</p>
          </div>

          <div>
              <h3 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                  {selectedGuide.specialties.map(s => (
                      <span key={s} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm">{s}</span>
                  ))}
              </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl flex gap-4">
              <JellyfishLogo className="w-8 h-8 text-teal-300 shrink-0" />
              <p className="text-sm text-teal-100 italic">
                  "{selectedGuide.name.split(' ')[1]} is one of my trusted friends in the Bloom. She'll take good care of you."
              </p>
          </div>

          {hasChatHistory(selectedGuide.id) ? (
            <button 
                onClick={() => onContinueBloomChat(selectedGuide)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20"
            >
                Continue Chat
            </button>
          ) : (
            <button 
                onClick={() => setIsComposingMessage(true)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition-all"
            >
                Send a message
            </button>
          )}
       </div>
    </div>
  );
};