export interface DailyLog {
  id: string;
  date: string; // ISO String
  
  // High-level metrics
  totalScore: number; // 0-18
  riskLevel: 'THRIVING' | 'MANAGING' | 'AT_RISK' | 'BURNOUT_ZONE';
  
  // Detailed Answers (0-3 points)
  answers: {
    core_q1: number; // Energy Recovery
    core_q2: number; // Mental Boundaries
    core_q3: number; // Anticipatory State
    core_q4: number; // Sleep Quality
    rotating_q5: number;
    rotating_q6: number;
    rotating_type: string; // e.g., 'Monday_Workload'
  };

  // Analysis Flags
  flags: string[]; // e.g., 'severe_exhaustion', 'sleep_crisis'
  
  // Legacy fields for backward compatibility/UI
  mood: number; // Mapped from Q3 (reversed)
  energy: number; // Mapped from Q1 (reversed)
  workload: number; // Mapped from Q2/Q5
  sleepHours: number; // Estimated from Q4
  notes: string;
}

export enum BurnoutRisk {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface AIAnalysis {
  riskLevel: BurnoutRisk;
  riskScore: number; // 0-100
  summary: string;
  actionableTips: string[];
  analyzedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type StickerArchetype = 'Jellyfish' | 'Turtle' | 'Anchor' | 'Spark' | 'Coral' | 'Storm';

export interface WeeklyCollectionItem {
  id: string;
  weekStartDate: string;
  story: string; // The "Story of the week"
  sticker: {
    archetype: StickerArchetype;
    name: string; // e.g., "The Resilient Coral"
    reason: string; // Why this character was chosen
    color: string; // Hex code for dominant color
  };
}

export interface WellnessTrivia {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconception: string; // The common wrong belief
}

export type DriftTime = 'Morning' | 'Afternoon' | 'Evening';

export interface UserProfile {
  name: string;
  jellyfishName: string;
  preferredDriftTime: DriftTime;
  isOnboarded: boolean;
  xp: number; // For mascot growth
  level: number;
}

export type ViewState = 
  | 'onboarding' 
  | 'dashboard' 
  | 'checkin' 
  | 'patterns' 
  | 'reflection'
  | 'collection'
  | 'chat' // Dr. Jelly Chat
  | 'bloom' // Changed from 'directory' to 'bloom' (Bloom Connections)
  | 'bloomChat' // New: for chatting with a specific Bloom Guide
  | 'settings';