
// ... (imports remain the same as provided)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DailyLog, UserProfile, WellnessTrivia } from '../types';
import { JellyfishLogo, ArrowRight, MessageSquare, Moon } from './Icons';
import { getCheckInReaction, getWellnessTrivia } from '../services/geminiService';
import { calculateDailyAnalysis, mapToLegacyScale } from '../services/analysisEngine';

interface CheckInProps {
  onSave: (log: DailyLog) => void;
  onCancel: () => void;
  userName: string;
  logs: DailyLog[]; 
  userLevel?: number; // Added level prop for evolution
  startInMapMode?: boolean;
}

export const CheckIn: React.FC<CheckInProps> = ({ onSave, onCancel, userName, logs, userLevel = 1, startInMapMode }) => {
  const [phase, setPhase] = useState<'LOADING_TRIVIA' | 'TRIVIA' | 'CHECKIN' | 'PROCESSING' | 'RESULT'>('LOADING_TRIVIA');
  const [currentQIndex, setCurrentQIndex] = useState(0); 
  const [reaction, setReaction] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finalLog, setFinalLog] = useState<DailyLog | null>(null);
  const [trivia, setTrivia] = useState<WellnessTrivia | null>(null);
  const [triviaAnswer, setTriviaAnswer] = useState<number | null>(null);
  const [mapRange, setMapRange] = useState<'WEEK' | 'TWO_WEEKS' | 'MONTH'>('WEEK');
  const isProcessingRef = useRef(false);

  const now = new Date();
  const isBeforeNoon = now.getHours() < 12;
  const timeContext = isBeforeNoon ? "yesterday" : "today";
  const timeContextCapitalized = isBeforeNoon ? "Yesterday" : "Today";

  // ... (Questions remain same as provided)
  const CORE_QUESTIONS = [
    {
      id: 'core_q1',
      text: `${timeContextCapitalized}, what did you have energy for?`,
      options: [
        { label: "✨ Things I wanted to do", score: 0 },
        { label: "📋 Just necessary stuff", score: 1 },
        { label: "🛋️ Only rest/collapse", score: 2 },
        { label: "💼 Kept working/couldn't stop", score: 3 },
      ]
    },
    {
      id: 'core_q2',
      text: `When you're not working, work thoughts...`,
      options: [
        { label: "🧘 Barely cross my mind", score: 0 },
        { label: "💭 Pop up sometimes", score: 1 },
        { label: "🔄 Keep pulling me back", score: 2 },
        { label: "🌀 Won't stop buzzing", score: 3 },
      ]
    },
    {
      id: 'core_q3',
      text: `Thinking about work ${timeContext}, you feel...`,
      options: [
        { label: "🌟 Pretty good about it", score: 0 },
        { label: "😐 Neutral, just work", score: 1 },
        { label: "😕 Bit heavy / 'ugh'", score: 2 },
        { label: "😰 Actual dread", score: 3 },
      ]
    },
    {
      id: 'core_q4',
      text: "This morning, how rested do you feel?",
      options: [
        { label: "😴 Recharged, slept great", score: 0 },
        { label: "😊 Got enough, feel okay", score: 1 },
        { label: "😐 Slept but still tired", score: 2 },
        { label: "😫 Exhausted, rough night", score: 3 },
      ]
    }
  ];

  const ROTATING_QUESTIONS_BY_DAY = [
    [{ id: 'rotating_q5', text: `This week, your work felt...`, type: 'Reward', options: [{ label: "🌟 Appreciated", score: 0 }, { label: "👍 Acknowledged", score: 1 }, { label: "🤷 Under-acknowledged", score: 2 }, { label: "👻 Invisible", score: 3 }] }, { id: 'rotating_q6', text: `Looking back at this week...`, type: 'Reflection', options: [{ label: "☀️ Pretty good", score: 0 }, { label: "⛅ Mixed", score: 1 }, { label: "🌧️ Draining", score: 2 }, { label: "⛈️ Really hard", score: 3 }] }],
    [{ id: 'rotating_q5', text: `${timeContextCapitalized}'s workload feels...`, type: 'Workload', options: [{ label: "🎯 Manageable", score: 0 }, { label: "📊 Full", score: 1 }, { label: "🌊 Scrambling", score: 2 }, { label: "🚫 Drowning", score: 3 }] }, { id: 'rotating_q6', text: `${isBeforeNoon ? "Before yesterday" : "Yesterday"}, did work stay in its lane?`, type: 'Boundaries', options: [{ label: "✅ Cleanly", score: 0 }, { label: "⏰ Ran over", score: 1 }, { label: "🌙 Spilled into evening", score: 2 }, { label: "🌀 Blurred", score: 3 }] }],
    [{ id: 'rotating_q5', text: `With your work ${timeContext}, you feel...`, type: 'Control', options: [{ label: "🎨 In control", score: 0 }, { label: "⚖️ Mostly", score: 1 }, { label: "🌀 Reactive", score: 2 }, { label: "🚫 Powerless", score: 3 }] }, { id: 'rotating_q6', text: `${timeContextCapitalized}, how much autonomy do you feel?`, type: 'Autonomy', options: [{ label: "🎨 Lots", score: 0 }, { label: "✅ Some", score: 1 }, { label: "📋 Following plan", score: 2 }, { label: "🚫 Zero", score: 3 }] }],
    [{ id: 'rotating_q5', text: `Right now, your work feels...`, type: 'Meaning', options: [{ label: "💫 Meaningful", score: 0 }, { label: "✨ Okay", score: 1 }, { label: "🤷 Motions", score: 2 }, { label: "❌ Pointless", score: 3 }] }, { id: 'rotating_q6', text: `Your work right now feels...`, type: 'Skills', options: [{ label: "🎯 Good fit", score: 0 }, { label: "👍 Mostly", score: 1 }, { label: "🤔 Mismatch", score: 2 }, { label: "❌ Wrong", score: 3 }] }],
    [{ id: 'rotating_q5', text: `At work lately, you feel...`, type: 'Community', options: [{ label: "🤗 Connected", score: 0 }, { label: "💬 Professional", score: 1 }, { label: "😶 Alone", score: 2 }, { label: "🚪 Isolated", score: 3 }] }, { id: 'rotating_q6', text: `If you needed help at work...`, type: 'Support', options: [{ label: "💯 Definitely", score: 0 }, { label: "👌 Probably", score: 1 }, { label: "🤷 Maybe", score: 2 }, { label: "🚫 No help", score: 3 }] }],
    [{ id: 'rotating_q5', text: `This week at work, you felt...`, type: 'Fairness', options: [{ label: "✅ Fairly", score: 0 }, { label: "👍 Mostly", score: 1 }, { label: "🤨 Unfairness", score: 2 }, { label: "⚖️ Unfair", stroke: 3 }] }, { id: 'rotating_q6', text: `Your trust in leadership is...`, type: 'Trust', options: [{ label: "💙 Strong", score: 0 }, { label: "👍 Good", score: 1 }, { label: "😐 Shaky", score: 2 }, { label: "🚫 Gone", score: 3 }] }],
    [{ id: 'rotating_q5', text: `This week, your body felt...`, type: 'Physical', options: [{ label: "💪 Healthy", score: 0 }, { label: "👌 Fine", score: 1 }, { label: "🤕 Tension", score: 2 }, { label: "😰 Symptoms", score: 3 }] }, { id: 'rotating_q6', text: `Days you moved 20+ min?`, type: 'Movement', options: [{ label: "💪 5-7 days", score: 0 }, { label: "🚶 3-4 days", score: 1 }, { label: "🐌 1-2 days", score: 2 }, { label: "🛋️ 0 days", score: 3 }] }]
  ];

  const dayIndex = now.getDay();
  const todaysQuestions = [...CORE_QUESTIONS, ...ROTATING_QUESTIONS_BY_DAY[dayIndex]];

  useEffect(() => {
    // Only fetch trivia once on mount
    let isMounted = true;

    const initializeCheckIn = async () => {
        if (startInMapMode) {
            const todayStr = new Date().toDateString();
            const existingToday = logs.find(l => new Date(l.date).toDateString() === todayStr);
            if (isMounted) {
                setFinalLog(existingToday || null);
                setPhase('RESULT');
            }
            return;
        }

        try {
            const data = await getWellnessTrivia();
            if (isMounted) {
                setTrivia(data);
                setPhase('TRIVIA');
            }
        } catch (e) {
            if (isMounted) {
                setPhase('CHECKIN');
            }
        }
    };

    initializeCheckIn();

    return () => {
        isMounted = false;
    };
  }, []);

  const handleAnswer = (score: number) => {
    const currentQ = todaysQuestions[currentQIndex];
    const newAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(newAnswers);
    if (currentQIndex < todaysQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishCheckIn(newAnswers);
    }
  };

  const finishCheckIn = useCallback(async (finalAnswers: Record<string, number>) => {
    // Prevent multiple concurrent calls
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setPhase('PROCESSING');
      const rawAnswers = {
          core_q1: finalAnswers['core_q1'],
          core_q2: finalAnswers['core_q2'],
          core_q3: finalAnswers['core_q3'],
          core_q4: finalAnswers['core_q4'],
          rotating_q5: finalAnswers['rotating_q5'],
          rotating_q6: finalAnswers['rotating_q6'],
          rotating_type: ROTATING_QUESTIONS_BY_DAY[dayIndex][0].type
      };
      const analysis = calculateDailyAnalysis(rawAnswers);
      const legacyMetrics = mapToLegacyScale(rawAnswers);
      const newLog: DailyLog = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          totalScore: analysis.totalScore,
          riskLevel: analysis.riskLevel,
          answers: rawAnswers,
          flags: analysis.flags,
          mood: legacyMetrics.mood,
          energy: legacyMetrics.energy,
          workload: legacyMetrics.workload,
          sleepHours: legacyMetrics.sleepHours,
          notes: `Checked in ${timeContext}. Risk: ${analysis.riskLevel}`
      };
      setFinalLog(newLog);
      try {
          const reactionText = await getCheckInReaction({ name: userName } as UserProfile, newLog);
          setReaction(reactionText);
      } catch (e) {
          console.error("Failed to get reaction:", e);
      }
      onSave(newLog);
      setPhase('RESULT');
    } finally {
      isProcessingRef.current = false;
    }
  }, [dayIndex, timeContext, userName, onSave]);

  const getLogSummary = (log: DailyLog) => {
    let mindState = 'Calm';
    if (log.mood <= 4) mindState = 'Heavy';
    if (log.mood <= 2) mindState = 'Stormy';
    if (log.answers?.core_q2 >= 2) mindState = 'Buzzing';
    let sleepState = 'Well';
    if (log.sleepHours < 6) sleepState = 'Poor';
    if (log.sleepHours >= 7) sleepState = 'Good';
    return `Mind: ${mindState} • Sleep: ${sleepState}`;
  };

  if (phase === 'LOADING_TRIVIA') return (
    <div className="h-full flex flex-col items-center justify-center p-4">
        <JellyfishLogo className="w-16 h-16 text-teal-300 animate-breathe mb-4" level={userLevel} />
        <p className="text-blue-300 animate-pulse">Finding a thought for you...</p>
    </div>
  );

  if (phase === 'TRIVIA' && trivia) return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md">
            {!triviaAnswer && triviaAnswer !== 0 ? (
                <>
                  <h2 className="text-xl font-medium text-white text-center mb-8">{trivia.question}</h2>
                  <div className="space-y-3">
                      {trivia.options.map((opt, i) => (
                          <button key={i} onClick={() => setTriviaAnswer(i)} className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-blue-100 hover:text-white">{opt}</button>
                      ))}
                  </div>
                </>
            ) : (
                <div className="animate-fade-in text-center">
                   <div className={`p-6 rounded-2xl mb-6 ${triviaAnswer === trivia.correctIndex ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                       <h3 className="font-bold text-lg text-white mb-2">{triviaAnswer === trivia.correctIndex ? "Correct!" : "Not quite!"}</h3>
                       <p className="text-blue-100 text-sm leading-relaxed mb-4">{trivia.explanation}</p>
                   </div>
                   <button onClick={() => setPhase('CHECKIN')} className="w-full py-4 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2">Start Check-In <ArrowRight className="w-4 h-4" /></button>
                </div>
            )}
        </div>
    </div>
  );

  if (phase === 'RESULT') {
      let numDaysToShow = mapRange === 'MONTH' ? 30 : mapRange === 'TWO_WEEKS' ? 14 : 7;
      const historyMap = Array.from({ length: numDaysToShow }, (_, i) => {
          const daysAgo = numDaysToShow - 1 - i;
          const d = new Date();
          d.setDate(d.getDate() - daysAgo);
          const dateStr = d.toDateString();
          let log = logs.find(l => new Date(l.date).toDateString() === dateStr);
          if (daysAgo === 0 && finalLog && !startInMapMode) log = finalLog;
          return { date: d, label: daysAgo === 0 ? 'TODAY' : daysAgo === 1 ? 'YESTERDAY' : d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(), fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), log, isToday: daysAgo === 0 };
      }).reverse();

      return (
        <div className="h-full flex flex-col p-6 animate-fade-in relative overflow-hidden">
             <div className="flex justify-between items-center mb-6 z-10">
                 {!startInMapMode && <div className="bg-teal-500/20 px-4 py-1.5 rounded-full border border-teal-500/30 flex items-center gap-2"><span className="text-teal-300 text-xs font-bold">+10 XP</span></div>}
                 <div className="text-xs text-blue-300 ml-auto">Journey Map</div>
             </div>
             <div className="flex justify-center bg-white/5 rounded-full p-1 mb-6 border border-white/10 z-10">
                {['WEEK', 'TWO_WEEKS', 'MONTH'].map((range) => (
                    <button key={range} onClick={() => setMapRange(range as any)} className={`flex-1 text-center py-2 px-3 rounded-full text-sm font-medium transition-all ${mapRange === range ? 'bg-teal-500/30 text-white' : 'text-blue-300 hover:bg-white/10'}`}>{range.replace('_', ' ')}</button>
                ))}
             </div>
             <div className="flex-1 relative pl-6 pr-2 overflow-y-auto">
                 <div className="absolute left-[39px] top-4 h-[calc(100%-32px)] w-0.5 bg-white/10" />
                 <div className="space-y-8 relative z-10 py-4">
                     {historyMap.map((item, i) => (
                         <div key={i} className={`flex items-start gap-6 group ${!item.log ? 'opacity-50' : ''}`}>
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-2 transition-all relative z-10 ${item.isToday ? 'bg-[#0f172a] border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.4)]' : item.log ? 'bg-[#0f172a] border-blue-500/30' : 'bg-[#0f172a] border-dashed border-white/10'}`}>
                                 <JellyfishLogo className={`${item.isToday ? 'w-10 h-10 text-teal-300 animate-breathe' : item.log ? 'w-8 h-8 text-blue-400' : 'w-6 h-6 text-white/20'}`} level={userLevel} />
                             </div>
                             <div className="pt-2">
                                 <span className="text-[10px] font-bold tracking-widest text-blue-400/80">{item.label}</span>
                                 <h3 className={`text-lg font-medium mb-1 ${item.isToday ? 'text-white' : 'text-blue-100'}`}>{item.fullDate}</h3>
                                 <div className="text-sm text-blue-300">{item.log ? getLogSummary(item.log) : <span className="text-white/30 italic">— Day drifted by</span>}</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             <button onClick={onCancel} className="mt-4 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10">Back to Dashboard</button>
        </div>
      );
  }

  const question = todaysQuestions[currentQIndex];
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
         <div className="flex gap-1 mb-8">
            {todaysQuestions.map((_, idx) => (
                <div key={idx} className={`h-1 flex-1 rounded-full transition-all ${idx <= currentQIndex ? 'bg-teal-400' : 'bg-white/10'}`} />
            ))}
         </div>
         {phase === 'CHECKIN' ? (
            <>
                <h2 className="text-xl font-medium text-center mb-8 min-h-[60px] flex items-center justify-center">{question.text}</h2>
                <div className="space-y-3">
                    {question.options.map((opt, idx) => (
                        <button key={idx} onClick={() => handleAnswer(opt.score)} className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 transition-all text-blue-100 hover:text-white flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${opt.score === 0 ? 'bg-teal-400' : opt.score === 1 ? 'bg-blue-400' : opt.score === 2 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                            {opt.label}
                        </button>
                    ))}
                </div>
            </>
         ) : <div className="text-center text-blue-300 animate-pulse mt-8">Processing your patterns...</div>}
         <button onClick={onCancel} className="mt-8 w-full text-center text-sm text-blue-400 hover:text-white transition-colors">Cancel</button>
      </div>
    </div>
  );
};
