
import React, { useState, useEffect } from 'react';
import { ViewState, DailyLog, AIAnalysis, UserProfile, WeeklyCollectionItem } from './types';
import { CheckIn } from './components/CheckIn';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { Patterns } from './components/Patterns';
import { BloomConnections, BloomGuide } from './components/BloomConnections';
import { Settings } from './components/Settings';
import { WeeklyReflection } from './components/WeeklyReflection';
import { Collection } from './components/Collection';
import { DrJellyChat } from './components/DrJellyChat';
import { BloomChat } from './components/BloomChat';
import { analyzeBurnoutRisks } from './services/geminiService';

const INITIAL_LOGS: DailyLog[] = [
  { 
    id: '1', 
    date: new Date(Date.now() - 86400000 * 4).toISOString(), 
    totalScore: 4, 
    riskLevel: 'THRIVING',
    answers: { core_q1: 0, core_q2: 1, core_q3: 0, core_q4: 0, rotating_q5: 0, rotating_q6: 0, rotating_type: 'Community' },
    flags: [],
    mood: 8, 
    energy: 7, 
    workload: 4, 
    sleepHours: 7.5, 
    notes: 'Good day' 
  },
  { 
    id: '2', 
    date: new Date(Date.now() - 86400000 * 3).toISOString(), 
    totalScore: 8, 
    riskLevel: 'MANAGING',
    answers: { core_q1: 1, core_q2: 1, core_q3: 1, core_q4: 1, rotating_q5: 1, rotating_q6: 0, rotating_type: 'Fairness' },
    flags: [],
    mood: 6, 
    energy: 6, 
    workload: 7, 
    sleepHours: 6, 
    notes: 'Busy' 
  }
];

const DEFAULT_USER: UserProfile = {
  name: '',
  jellyfishName: '',
  preferredDriftTime: 'Evening',
  isOnboarded: false,
  xp: 0,
  level: 1
};

export default function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [logs, setLogs] = useState<DailyLog[]>(INITIAL_LOGS);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [collection, setCollection] = useState<WeeklyCollectionItem[]>([]);
  const [checkInMode, setCheckInMode] = useState<'new' | 'view'>('new');
  const [selectedBloomGuide, setSelectedBloomGuide] = useState<BloomGuide | null>(null);
  const [initialBloomChatMessage, setInitialBloomChatMessage] = useState<string | undefined>(undefined);
  const [isKeyReady, setIsKeyReady] = useState(false);

  // Persistence and API Key check
  useEffect(() => {
    const savedUser = localStorage.getItem('jellyfish_user');
    const savedLogs = localStorage.getItem('jellyfish_logs');
    const savedAnalysis = localStorage.getItem('jellyfish_analysis');
    const savedCollection = localStorage.getItem('jellyfish_collection');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser({ ...DEFAULT_USER, ...parsedUser });
      if (parsedUser.isOnboarded) setView('dashboard');
    }

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
    if (savedCollection) setCollection(JSON.parse(savedCollection));

    // Check if API Key is configured in environment or already selected in frame
    const checkKey = async () => {
      const hasEnvKey = process.env.API_KEY && process.env.API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
      const hasAistudioKey = await (window as any).aistudio?.hasSelectedApiKey();
      
      if (hasEnvKey || hasAistudioKey) {
        setIsKeyReady(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelection = async () => {
    try {
      await (window as any).aistudio?.openSelectKey();
      setIsKeyReady(true); // Assume success per race condition guidelines
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  // Save persistence
  useEffect(() => localStorage.setItem('jellyfish_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('jellyfish_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => { if (analysis) localStorage.setItem('jellyfish_analysis', JSON.stringify(analysis)); }, [analysis]);
  useEffect(() => localStorage.setItem('jellyfish_collection', JSON.stringify(collection)), [collection]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    setView('dashboard');
  };

  const handleUpdateUser = (updated: UserProfile) => {
      setUser(updated);
  };

  const handleSaveLog = (newLog: DailyLog) => {
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    const newXP = (user.xp || 0) + 10;
    const newLevel = Math.floor(newXP / 100) + 1;
    setUser(prev => ({ ...prev, xp: newXP, level: newLevel }));
    handleAnalyze(updatedLogs);
  };

  const handleAnalyze = async (currentLogs: DailyLog[]) => {
    if (currentLogs.length < 3 || !isKeyReady) return;
    try {
      const result = await analyzeBurnoutRisks(currentLogs);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSticker = (item: WeeklyCollectionItem) => {
      setCollection(prev => [item, ...prev]);
  };

  const handleReset = () => {
    localStorage.clear();
    setUser(DEFAULT_USER);
    setLogs(INITIAL_LOGS);
    setAnalysis(null);
    setCollection([]);
    setView('onboarding');
  };

  const handleInitiateBloomChat = (guide: BloomGuide, message: string) => {
    setSelectedBloomGuide(guide);
    setInitialBloomChatMessage(message);
    setView('bloomChat');
  };

  const handleContinueBloomChat = (guide: BloomGuide) => {
    setSelectedBloomGuide(guide);
    setInitialBloomChatMessage(undefined);
    setView('bloomChat');
  };

  // If key is not ready, show a simple Connect screen (common for public demos)
  if (!isKeyReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="p-4 bg-teal-500/10 rounded-full">
              <div className="w-16 h-16 flex items-center justify-center text-teal-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M12 2c-4 0-7.5 3-7.5 7 0 2.5 1.5 4.5 3.5 6"/><path d="M12 2c4 0 7.5 3 7.5 7 0 2.5-1.5 4.5-3.5 6"/><path d="M5.5 13a7 7 0 0 1 13 0"/><path d="M9 15c-1 2-1 5 0 7"/><path d="M15 15c1 2 1 5 0 7"/><path d="M12 15c0 2 0 5 0 7"/></svg>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Connect to Gemini</h1>
          <p className="text-slate-400 text-sm">
            To view this project publicly without leaking the developer's key, please connect your own Gemini API key. 
            Your key remains private to your session.
          </p>
          <button 
            onClick={handleOpenKeySelection}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-900/20"
          >
            Connect API Key
          </button>
          <p className="text-[10px] text-slate-500">
            Need a key? Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">billing documentation</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-md mx-auto h-screen md:h-auto md:min-h-screen md:py-10 flex flex-col">
        <main className="flex-1 md:bg-white/5 md:backdrop-blur-sm md:rounded-3xl md:border md:border-white/5 md:shadow-2xl md:overflow-hidden relative">
          
          {view === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
          
          {view === 'dashboard' && (
            <Dashboard 
              user={user} 
              logs={logs} 
              onCheckIn={() => { setCheckInMode('new'); setView('checkin'); }}
              onViewMap={() => { setCheckInMode('view'); setView('checkin'); }}
              onNavigate={setView}
            />
          )}

          {view === 'checkin' && (
            <CheckIn 
              userName={user.name}
              logs={logs}
              onSave={handleSaveLog}
              onCancel={() => setView('dashboard')}
              startInMapMode={checkInMode === 'view'}
            />
          )}

          {view === 'patterns' && (
            <Patterns 
              logs={logs}
              user={user}
              analysis={analysis}
              onBack={() => setView('dashboard')}
              onNavigateToBloom={() => setView('bloom')}
            />
          )}

          {view === 'reflection' && (
            <WeeklyReflection 
              user={user}
              logs={logs}
              onClose={() => setView('dashboard')}
              onNavigateToBloom={() => setView('bloom')}
              onSaveSticker={handleSaveSticker}
            />
          )}

          {view === 'collection' && (
            <Collection 
                items={collection}
                onBack={() => setView('dashboard')}
            />
          )}

          {view === 'bloom' && <BloomConnections 
              user={user}
              onBack={() => setView('dashboard')}
              onInitiateBloomChat={handleInitiateBloomChat}
              onContinueBloomChat={handleContinueBloomChat}
            />}

          {view === 'chat' && <DrJellyChat
              logs={logs}
              onBack={() => setView('dashboard')}
            />}

          {view === 'bloomChat' && selectedBloomGuide && (
              <BloomChat 
                guide={selectedBloomGuide}
                logs={logs}
                onBack={() => setView('bloom')}
                initialMessage={initialBloomChatMessage}
              />
          )}

          {view === 'settings' && (
            <Settings 
              user={user}
              onBack={() => setView('dashboard')}
              onReset={handleReset}
              onUpdateUser={handleUpdateUser}
            />
          )}

        </main>
      </div>
    </div>
  );
}
