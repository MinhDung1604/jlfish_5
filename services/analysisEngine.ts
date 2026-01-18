import { DailyLog } from '../types';

interface RawAnswers {
  core_q1: number;
  core_q2: number;
  core_q3: number;
  core_q4: number;
  rotating_q5: number;
  rotating_q6: number;
  rotating_type: string;
}

export const calculateDailyAnalysis = (answers: RawAnswers) => {
  // 1. Calculate Score
  const totalScore = 
    answers.core_q1 + 
    answers.core_q2 + 
    answers.core_q3 + 
    answers.core_q4 + 
    answers.rotating_q5 + 
    answers.rotating_q6;

  // 2. Determine Risk Level
  let riskLevel: DailyLog['riskLevel'] = 'THRIVING';
  if (totalScore >= 14) riskLevel = 'BURNOUT_ZONE';
  else if (totalScore >= 10) riskLevel = 'AT_RISK';
  else if (totalScore >= 5) riskLevel = 'MANAGING';

  // 3. Detect Red Flags
  const flags: string[] = [];

  // EXHAUSTION
  if (answers.core_q1 >= 3) flags.push('severe_exhaustion');
  if (answers.core_q4 >= 3) flags.push('sleep_crisis');
  if (answers.core_q1 >= 2 && answers.core_q4 >= 2) flags.push('physical_depletion');

  // CYNICISM & BOUNDARIES
  if (answers.core_q3 >= 3) flags.push('acute_dread');
  if (answers.core_q2 >= 3) flags.push('chronic_rumination');

  // COMBOS
  if (answers.core_q1 >= 2 && answers.core_q2 >= 2) flags.push('exhaustion_spiral');
  
  // ROTATING CONTEXT
  // Assuming 0-3 scale for rotating questions too
  if (answers.rotating_q5 >= 3) flags.push('rotating_factor_crisis');

  return { totalScore, riskLevel, flags };
};

// Map the 0-3 scores back to legacy 1-10 scales for charts
export const mapToLegacyScale = (answers: RawAnswers) => {
  // Energy (Q1): 0(High) -> 3(Low)  => Map to 10 -> 1
  const energy = Math.max(1, 10 - (answers.core_q1 * 3));
  
  // Mood (Q3): 0(Good) -> 3(Dread) => Map to 10 -> 1
  const mood = Math.max(1, 10 - (answers.core_q3 * 3));

  // Workload (Q2): 0(Low) -> 3(High) => Map to 1 -> 10
  const workload = Math.min(10, 1 + (answers.core_q2 * 3));

  // Sleep (Q4): 0(Great) -> 3(Exhausted) => Map to 8h -> 4h
  let sleepHours = 8;
  if (answers.core_q4 === 1) sleepHours = 7;
  if (answers.core_q4 === 2) sleepHours = 5.5;
  if (answers.core_q4 === 3) sleepHours = 4;

  return { mood, energy, workload, sleepHours };
};