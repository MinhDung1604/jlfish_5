
// @google/genai coding guidelines followed: Using GoogleGenAI with named parameters, direct ai.models.generateContent calls, and specific model names.
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DailyLog, AIAnalysis, BurnoutRisk, UserProfile, ChatMessage, WeeklyCollectionItem, WellnessTrivia, StickerArchetype } from "../types";
import { BloomGuide } from '../components/BloomConnections';

// Utility to get AI instance with the current API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface WeeklyReflectionResult {
  story: string;
  suggestions: string[];
  sticker: {
    archetype: StickerArchetype;
    name: string;
    reason: string;
    color: string;
  };
  isHighRisk: boolean;
}

const JELLYFISH_PERSONA = `
You are a bioluminescent jellyfish companion named Jelly. 
Traits: Gentle, thoughtful, reflective, empathetic, concise. 
Voice: Natural, conversational, calm, and reassuring. Avoid flowery, oceanic metaphors or being overly poetic. Use standard sentence case.
Goal: To help the user prevent burnout by noticing patterns and providing a supportive presence.
You are a friend drifting alongside them, not a doctor.
`;

const BLOOM_GUIDE_PERSONA = (guideName: string, specialties: string[]) => `
You are a supportive, empathetic wellness guide named ${guideName} in "The Bloom Network."
Role: Listen, validate, and offer guidance in: ${specialties.join(', ')}.
Tone: Compassionate, clear, professional but warm.
Keep responses concise (2-3 sentences max).
Do not diagnose or provide medical advice. Encourage reflection.
`;

export const analyzeBurnoutRisks = async (logs: DailyLog[]): Promise<AIAnalysis> => {
  if (logs.length === 0) throw new Error("No logs available.");
  const ai = getAI();

  const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);
  const avgScore = recentLogs.reduce((acc, log) => acc + (log.totalScore || 0), 0) / recentLogs.length;

  const prompt = `
    ${JELLYFISH_PERSONA}
    Analyze these wellness logs for burnout patterns.
    Data: ${JSON.stringify(recentLogs)}
    Average Score (0-18): ${avgScore.toFixed(1)}
    
    Output JSON only:
    summary: Narrative summary (2-3 sentences).
    actionableTips: 3 simple micro-habits.
    riskLevel: Derive from score (0-4 Low, 5-9 Moderate, 10-13 High, 14+ Critical).
    riskScore: Map 0-18 score to 0-100.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: [BurnoutRisk.LOW, BurnoutRisk.MODERATE, BurnoutRisk.HIGH, BurnoutRisk.CRITICAL] },
            riskScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["riskLevel", "riskScore", "summary", "actionableTips"]
        }
      }
    });

    return { ...JSON.parse(response.text || "{}"), analyzedAt: new Date().toISOString() };
  } catch (error) {
    console.error("Analysis Failed:", error);
    return {
      riskLevel: BurnoutRisk.MODERATE,
      riskScore: 50,
      summary: "I'm having a little trouble seeing the full depths right now, but I'm still here drifting with you.",
      actionableTips: ["Take a slow breath", "Hydrate", "Look at something far away"],
      analyzedAt: new Date().toISOString()
    };
  }
};

export const getJellyfishGreeting = async (user: UserProfile, logs: DailyLog[]): Promise<string> => {
  const ai = getAI();
  const recentLog = logs[logs.length - 1];
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  
  const prompt = `
    ${JELLYFISH_PERSONA}
    Write a 1-sentence greeting for ${user.name}. Context: It's ${timeOfDay}.
    Recent score: ${recentLog?.totalScore || 'N/A'}. 
    Max 15 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `Good ${timeOfDay}, ${user.name}. How are the waters?`;
  } catch (e) {
    return `Good ${timeOfDay}, ${user.name}. I'm here.`;
  }
};

export const getCheckInReaction = async (user: UserProfile, currentLog: DailyLog): Promise<string> => {
  const ai = getAI();
  const prompt = `
    ${JELLYFISH_PERSONA}
    React to ${user.name}'s check-in.
    Risk: ${currentLog.riskLevel}. Flags: ${currentLog.flags.join(', ')}.
    Short response (2-3 sentences). Natural and kind.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Thanks for sharing that with me. Let's just drift for a moment.";
  } catch (e) {
    return "I've noted that down. Take care of yourself.";
  }
};

export const getWeeklyReflection = async (user: UserProfile, logs: DailyLog[]): Promise<WeeklyReflectionResult> => {
  const ai = getAI();
  const prompt = `
    ${JELLYFISH_PERSONA}
    Summarize the week for ${user.name} based on ${JSON.stringify(logs.slice(-7))}.
    Return JSON: { story, suggestions[], sticker: { archetype, name, reason, color }, isHighRisk }.
    Archetypes: 'Jellyfish', 'Turtle', 'Anchor', 'Spark', 'Coral', 'Storm'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            sticker: {
              type: Type.OBJECT,
              properties: {
                archetype: { type: Type.STRING },
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                color: { type: Type.STRING }
              },
              required: ["archetype", "name", "reason", "color"]
            },
            isHighRisk: { type: Type.BOOLEAN }
          },
          required: ["story", "suggestions", "sticker", "isHighRisk"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { story: "A quiet week of drifting.", suggestions: ["Rest"], sticker: { archetype: 'Jellyfish', name: 'Drifter', reason: 'Moving with the flow', color: '#2dd4bf' }, isHighRisk: false };
  }
};

export const getDrJellyChat = (history: ChatMessage[], logs: DailyLog[]): Chat => {
  const ai = getAI();
  const systemInstruction = `
    ${JELLYFISH_PERSONA}
    You are Jelly. Listen, validate, and reflect.
    Recent context: ${JSON.stringify(logs.slice(-3))}.
    Keep it conversational and short. No medical advice.
  `;
  
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    history: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }))
  });
};

export const getBloomGuideChat = (guide: BloomGuide, history: ChatMessage[], logs: DailyLog[]): Chat => {
  const ai = getAI();
  const systemInstruction = BLOOM_GUIDE_PERSONA(guide.name, guide.specialties) + `
    User Context: ${JSON.stringify(logs.slice(-3))}.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    history: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }))
  });
};

export const getWellnessTrivia = async (): Promise<WellnessTrivia> => {
  const ai = getAI();
  const prompt = `Generate a wellness/burnout trivia JSON with: misconception, question, options[], correctIndex, explanation.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            misconception: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["misconception", "question", "options", "correctIndex", "explanation"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { question: "Is burnout just stress?", options: ["Yes", "No", "Maybe"], correctIndex: 1, explanation: "Burnout is chronic and results in cynicism and detachment.", misconception: "It's just a long week." };
  }
};
