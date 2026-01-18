
import React, { useMemo } from 'react';
import { DailyLog, AIAnalysis, UserProfile } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from './Icons';

interface PatternsProps {
  logs: DailyLog[];
  user: UserProfile;
  analysis: AIAnalysis | null;
  onBack: () => void;
  onNavigateToBloom: () => void;
}

export const Patterns: React.FC<PatternsProps> = ({ logs, analysis, onBack, onNavigateToBloom }) => {
  const chartData = useMemo(() => {
    return [...logs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
      .map(log => ({
        day: new Date(log.date).getDate(),
        fullDate: new Date(log.date).toLocaleDateString(),
        score: log.totalScore ?? 0,
        risk: log.riskLevel
      }));
  }, [logs]);

  const significantFactors = useMemo(() => {
    if (logs.length === 0) return [];
    const sums = { energy: 0, boundaries: 0, dread: 0, sleep: 0 };
    const counts = logs.length;
    logs.forEach(log => {
        if(log.answers) {
            sums.energy += log.answers.core_q1;
            sums.boundaries += log.answers.core_q2;
            sums.dread += log.answers.core_q3;
            sums.sleep += log.answers.core_q4;
        }
    });
    const factors = [
        { name: "Low Energy", score: sums.energy / counts, color: "#f472b6" },
        { name: "Work Boundaries", score: sums.boundaries / counts, color: "#a78bfa" },
        { name: "Work Dread", score: sums.dread / counts, color: "#fb923c" },
        { name: "Poor Sleep", score: sums.sleep / counts, color: "#2dd4bf" },
    ];
    return factors.sort((a,b) => b.score - a.score);
  }, [logs]);

  return (
    <div className="h-full flex flex-col animate-fade-in pb-20">
      <div className="flex items-center gap-4 mb-6 p-2">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-blue-200" />
        </button>
        <h1 className="text-xl font-semibold">What I've Noticed</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 px-2">
        {analysis && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-xs uppercase tracking-wider text-teal-400 mb-3 font-semibold">Story of the Month</h3>
                <p className="text-blue-100 leading-relaxed text-sm whitespace-pre-line">{analysis.summary}</p>
            </div>
        )}

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium text-blue-200">30-Day Trend</h3>
            <span className="text-xs text-blue-400 mt-1">Burnout Score (0-18)</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                <Tooltip 
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} 
                />
                <Area type="monotone" dataKey="score" stroke="#f43f5e" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-blue-200 px-2 mb-4">Significant Stressors</h3>
            <div className="space-y-3">
                {significantFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-32 text-xs text-blue-200">{factor.name}</div>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(factor.score / 3) * 100}%`, backgroundColor: factor.color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {analysis && (
            <div className="space-y-4 mt-6">
                <h3 className="text-sm font-semibold text-blue-200 px-2">Suggestions for you</h3>
                <div className="space-y-2">
                    {analysis.actionableTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                            <span className="text-teal-400 font-bold text-lg leading-none mt-1">•</span>
                            <p className="text-sm text-blue-100">{tip}</p>
                        </div>
                    ))}
                </div>
                
                {/* Bloom Referral */}
                <div className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-2xl mt-4 text-center">
                    <p className="text-indigo-200 text-sm mb-4">I can introduce you to some of my friends if you'd like to dive deeper into these patterns.</p>
                    <button onClick={onNavigateToBloom} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all shadow-lg">
                        Meet Bloom Guides
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
