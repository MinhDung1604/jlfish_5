
// ... (imports remain the same as provided)
import React, { useState, useEffect, useRef } from 'react';
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

const BubbleTransition = ({ trigger, onStart, onEnd }: { trigger: any, onStart?: () => void, onEnd?: () => void }) => {
  const [bubbles, setBubbles] = useState<{ id: number, size: number, left: number, delay: number, duration: number, blur: number }[]>([]);

  useEffect(() => {
    onStart?.();
    const newBubbles = Array.from({ length: 22 }).map((_, i) => ({
      id: i + Date.now(),
      size: Math.random() * 40 + 10,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.2 + Math.random() * 1.0,
      blur: Math.random() * 3
    }));
    setBubbles(newBubbles);

    const timer = setTimeout(() => {
      setBubbles([]);
      onEnd?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <>
      {bubbles.map(b => (
        <div 
          key={b.id} 
          className="transition-bubble" 
          style={{ 
            width: b.size, 
            height: b.size, 
            left: `${b.left}%`, 
            filter: `blur(${b.blur}px)`,
            animation: `bubble-rise-organic ${b.duration}s cubic-bezier(0.4, 0, 0.2, 1) ${b.delay}s forwards` 
          }} 
        />
      ))}
    </>
  );
};

// ... (INITIAL_LOGS and DEFAULT_USER remain same)
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
  preferredDriftTime: '20:00',
  preferredColor: '#2dd4bf', // Added missing preferredColor property
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
  const [isTransitioning, setIsTransitioning] = useState(false);

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
  }, []);

  useEffect(() => localStorage.setItem('jellyfish_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('jellyfish_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => { if (analysis) localStorage.setItem('jellyfish_analysis', JSON.stringify(analysis)); }, [analysis]);
  useEffect(() => localStorage.setItem('jellyfish_collection', JSON.stringify(collection)), [collection]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    setView('dashboard');
  };

  const handleUpdateUser = (updated: UserProfile) => setUser(updated);

  const handleSaveLog = (newLog: DailyLog) => {
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    const newXP = (user.xp || 0) + 10;
    const newLevel = Math.min(Math.floor(newXP / 100) + 1, 10); // Cap at level 10
    const todayStr = new Date().toDateString();
    setUser(prev => ({ 
      ...prev, 
      xp: newXP, 
      level: newLevel,
      lastCheckInDate: todayStr
    }));
    handleAnalyze(updatedLogs);
  };

  const handleAnalyze = async (currentLogs: DailyLog[]) => {
    if (currentLogs.length < 3) return;
    try {
      const result = await analyzeBurnoutRisks(currentLogs);
      setAnalysis(result);
    } catch (e) { console.error(e); }
  };

  const handleSaveSticker = (item: WeeklyCollectionItem) => setCollection(prev => [item, ...prev]);

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

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-[#050a18] select-none touch-none">
      <BubbleTransition 
        trigger={view} 
        onStart={() => setIsTransitioning(true)}
        onEnd={() => setIsTransitioning(false)}
      />
      
      <div className={`fixed inset-0 transition-all duration-[2000ms] ease-in-out opacity-40 pointer-events-none`}>
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] animate-pulse ${
          view === 'dashboard' ? 'bg-teal-900/30' : 
          view === 'checkin' ? 'bg-blue-900/30' : 
          'bg-indigo-900/30'
        }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] ${
          view === 'dashboard' ? 'bg-blue-900/20' : 
          view === 'checkin' ? 'bg-teal-900/20' : 
          'bg-purple-900/20'
        }`} />
      </div>

      <div className="relative w-full h-full max-w-md mx-auto flex flex-col touch-auto">
        <main className="flex-1 overflow-hidden relative animate-page-enter h-full" key={view}>
          {view === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
          
          <div className="h-full w-full scroll-container">
              {view === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  logs={logs} 
                  onCheckIn={() => { setCheckInMode('new'); setView('checkin'); }}
                  onViewMap={() => { setCheckInMode('view'); setView('checkin'); }}
                  onNavigate={setView}
                  collection={collection}
                />
              )}

              {view === 'checkin' && (
                <CheckIn 
                  userName={user.name}
                  logs={logs}
                  userLevel={user.level}
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
                  collection={collection}
                  onClose={() => setView('dashboard')}
                  onNavigateToBloom={() => setView('bloom')}
                  onSaveSticker={handleSaveSticker}
                />
              )}

              {view === 'collection' && (
                <Collection items={collection} onBack={() => setView('dashboard')} />
              )}

              {view === 'bloom' && (
                <BloomConnections 
                  user={user}
                  onBack={() => setView('dashboard')}
                  onInitiateBloomChat={handleInitiateBloomChat}
                  onContinueBloomChat={(guide) => { setSelectedBloomGuide(guide); setView('bloomChat'); }}
                />
              )}

              {view === 'chat' && <DrJellyChat logs={logs} onBack={() => setView('dashboard')} />}

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
          </div>
        </main>
      </div>
    </div>
  );
}
