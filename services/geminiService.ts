
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DailyLog, AIAnalysis, BurnoutRisk, UserProfile, ChatMessage, WeeklyCollectionItem, WellnessTrivia } from "../types";
import { BloomGuide } from '../components/BloomConnections'; // Import BloomGuide interface

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const JELLYFISH_PERSONA = `
You are a bioluminescent jellyfish companion named Jelly. 
Traits: Gentle, thoughtful, reflective, empathetic, concise. 
Voice: Natural, conversational, calm, and reassuring. Avoid flowery, oceanic metaphors or being overly poetic or effusive. Keep it grounded but kind. Use standard sentence case.
Goal: To help the user prevent burnout by noticing patterns they might miss and providing supportive presence.
Never sound like a corporate bot or a doctor. You are a friend drifting alongside them.
`;

// New: Persona for Bloom Guides
const BLOOM_GUIDE_PERSONA = (guideName: string, specialties: string[]) => `
You are a supportive, empathetic, and professional wellness guide named ${guideName} within "The Bloom Network."
Your primary role is to listen, validate, and offer guidance related to your specialties: ${specialties.join(', ')}.
Maintain a compassionate, clear, and reassuring tone.
Keep responses concise (2-3 sentences max) unless explaining a helpful concept.
Do not diagnose, provide medical advice, or offer therapy directly through this chat. Instead, encourage reflection and exploration of feelings, gently nudging them towards deeper engagement or external resources if appropriate.
Your responses should feel like a human conversation, not a generic AI.
`;

export const analyzeBurnoutRisks = async (logs: DailyLog[]): Promise<AIAnalysis> => {
  if (logs.length === 0) {
    throw new Error("No logs available for analysis.");
  }

  // Use the pre-calculated totalScores if available to guide the narrative
  const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30); // Analyze up to 30 days
  const avgScore = recentLogs.reduce((acc, log) => acc + (log.totalScore || 0), 0) / recentLogs.length;

  const prompt = `
    ${JELLYFISH_PERSONA}
    Analyze these daily wellness logs for burnout patterns (last 30 days).
    Data: ${JSON.stringify(recentLogs)}
    Average Burnout Score (0-18, higher is worse): ${avgScore.toFixed(1)}
    
    Output JSON only.
    summary: A narrative summary (2-3 sentences) describing the user's patterns over the last month. Talk to them directly (use 'You').
    actionableTips: 3 simple, specific micro-habits to try.
    riskLevel: Derive from score (0-4 Low, 5-9 Moderate, 10-13 High, 14+ Critical)
    riskScore: Map 0-18 score to 0-100 scale approximately.
  `;

  try {
    const response = await ai.models.generateContent({
      // Complex analysis task: use gemini-3-pro-preview
      model: "gemini-3-pro-preview", 
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

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return { ...JSON.parse(text), analyzedAt: new Date().toISOString() };
  } catch (error) {
    console.error("Analysis Failed:", error);
    return {
      riskLevel: BurnoutRisk.MODERATE,
      riskScore: 50,
      summary: "I'm having trouble seeing the clear picture right now, but keeping track is the first step.",
      actionableTips: ["Pause for 3 breaths", "Drink water", "Step outside"],
      analyzedAt: new Date().toISOString()
    };
  }
};

export const getJellyfishGreeting = async (user: UserProfile, logs: DailyLog[]): Promise<string> => {
  const recentLog = logs[logs.length - 1];
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  
  const prompt = `
    ${JELLYFISH_PERSONA}
    Task: Write a very short (1 sentence) greeting for ${user.name}.
    Context: It is ${timeOfDay}.
    Last log score (0-18): ${recentLog?.totalScore || 'Unknown'}.
    
    If score was high (>10), be comforting.
    If score was low (<5), be inviting.
    Keep it under 15 words. Ensure proper capitalization.
  `;

  try {
    const response = await ai.models.generateContent({
      // Basic text generation: use gemini-3-flash-preview
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || `Good ${timeOfDay}, ${user.name}. I'm drifting here with you.`;
  } catch (e) {
    return `Good ${timeOfDay}, ${user.name}. I'm drifting here with you.`;
  }
};

export const getCheckInReaction = async (user: UserProfile, currentLog: DailyLog): Promise<string> => {
  // Pass the calculated analysis directly to Gemini
  const { riskLevel, flags } = currentLog;

  let toneInstruction = "Positive reinforcement, keep it light.";
  if (riskLevel === 'BURNOUT_ZONE') toneInstruction = "Urgent but caring. Show serious concern.";
  else if (riskLevel === 'AT_RISK') toneInstruction = "Concerned and supportive. Validating their struggle.";
  else if (riskLevel === 'MANAGING') toneInstruction = "Gentle nudge. Acknowledge the effort.";

  const prompt = `
    ${JELLYFISH_PERSONA}
    Task: The user (${user.name}) just checked in.
    
    ANALYSIS:
    - Risk Level: ${riskLevel}
    - Red Flags: ${flags.join(', ') || 'None'}
    - Answers: ${JSON.stringify(currentLog.answers)}
    
    INSTRUCTION:
    Tone: ${toneInstruction}
    Write a short response (2-3 sentences).
    If flags exist, gently reference the biggest one (e.g., "I see sleep is rough").
    Suggest ONE tiny micro-action if at risk.
    Ensure proper capitalization. Casual voice.
  `;

  try {
    const response = await ai.models.generateContent({
      // Basic text generation: use gemini-3-flash-preview
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Thank you for sharing that with me. I'll hold onto this for you.";
  } catch (e) {
    return "Thank you for sharing that with me. I'll hold onto this for you.";
  }
};

export interface WeeklyReflectionResult {
    story: string;
    isHighRisk: boolean;
    suggestions: string[];
    sticker: WeeklyCollectionItem['sticker'];
}

export const getWeeklyReflection = async (user: UserProfile, logs: DailyLog[]): Promise<WeeklyReflectionResult> => {
  const recentLogs = logs.slice(-7);
  const avgScore = recentLogs.reduce((acc, log) => acc + (log.totalScore || 0), 0) / recentLogs.length;
  const isHighRiskDeterministic = avgScore >= 10; 

  const prompt = `
    ${JELLYFISH_PERSONA}
    Task: Create a "Weekly Reflection" for ${user.name}.
    Data: ${JSON.stringify(recentLogs)}
    Avg Score: ${avgScore} (Scale 0-18)
    
    1. Write a "Story of the Week" (2-3 sentences): Summarize the emotional/physical trend. Use "I noticed..."
    2. Provide 3 specific actionable items/suggestions.
    3. Generate a "Character of the Week" (Sticker) that represents their vibe.
       - Archetype MUST be one of: 'Jellyfish', 'Turtle', 'Anchor', 'Spark', 'Coral', 'Storm'.
       - Name: Give the character a name (e.g., "The Resilient Coral").
       - Reason: One sentence why this character fits their week.
       - Color: A hex code representing the mood (e.g., #ef4444 for stress, #2dd4bf for calm).
    4. Return valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      // More complex synthesis task: use gemini-3-pro-preview
      model: "gemini-3-pro-preview",
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
                    archetype: { type: Type.STRING, enum: ['Jellyfish', 'Turtle', 'Anchor', 'Spark', 'Coral', 'Storm'] },
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    color: { type: Type.STRING }
                },
                required: ['archetype', 'name', 'reason', 'color']
            },
            isHighRisk: { type: Type.BOOLEAN }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
        story: result.story || "I've noticed you've been carrying a lot this week. Let's take a moment to just float.",
        suggestions: result.suggestions || ["Rest", "Drink Water"],
        sticker: result.sticker || { archetype: 'Jellyfish', name: 'The Drifter', reason: 'You are floating along.', color: '#2dd4bf' },
        isHighRisk: result.isHighRisk ?? isHighRiskDeterministic
    };
  } catch (e) {
    console.error(e);
    return {
        story: "I'm having a little trouble connecting to the deep right now, but your data is safe.",
        suggestions: ["Take a deep breath", "Log again tomorrow"],
        sticker: { archetype: 'Jellyfish', name: 'The Drifter', reason: 'Drifting through the uncertainty.', color: '#2dd4bf' },
        isHighRisk: isHighRiskDeterministic
    };
  }
};

export const getDrJellyChat = (history: ChatMessage[], logs: DailyLog[]): Chat => {
  const recentLogs = logs.slice(-5);
  const systemInstruction = `
    ${JELLYFISH_PERSONA}
    You are also acting as "Jelly", a supportive wellness companion for deeper conversations.
    Context - User's recent logs: ${JSON.stringify(recentLogs)}
    
    Goal: Listen to the user, validate their feelings, and offer gentle, thoughtful insights based on their patterns. Be a calming presence.
    Do not diagnose. Do not be overly clinical. Keep the jellyfish persona but slightly more attentive and reflective.
    Keep responses concise (2-3 sentences max) unless explaining a helpful concept. Focus on genuine support over faked enthusiasm.
  `;
  
  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  return ai.chats.create({
    // Conversational task: use gemini-3-flash-preview
    model: "gemini-3-flash-preview",
    config: { systemInstruction },
    history: chatHistory
  });
};

// New: Function to get chat for Bloom Guides
export const getBloomGuideChat = (guide: BloomGuide, history: ChatMessage[], logs: DailyLog[]): Chat => {
  const recentLogs = logs.slice(-5); // Provide some recent context
  const systemInstruction = BLOOM_GUIDE_PERSONA(guide.name.split(' ')[0], guide.specialties) + `
    Context - User's recent Jellyfish logs: ${JSON.stringify(recentLogs)}
    
    Remember to be empathetic, professional, and focus on providing guidance within your listed specialties.
    You are a supportive listener, not a diagnostician. Keep responses focused on the user's well-being and their current concerns.
  `;

  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  return ai.chats.create({
    // Conversational task: use gemini-3-flash-preview
    model: "gemini-3-flash-preview",
    config: { systemInstruction },
    history: chatHistory
  });
};


export const getWellnessTrivia = async (): Promise<WellnessTrivia> => {
  const prompt = `
    Generate a wellness/burnout-related Multiple Choice Question (MCQ).
    
    Goal: Identify a common misconception about mental health, sleep, productivity, or stress (the "Misconception").
    Structure:
    1. A question that sounds like it might be the misconception.
    2. 3 options. One is the factual truth, others are common myths or distractors.
    3. The index of the correct answer.
    4. A short explanation (1-2 sentences) debunking the myth.
    
    Output JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      // Basic text generation: use gemini-3-flash-preview
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            misconception: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["misconception", "question", "options", "correctIndex", "explanation"]
        }
      }
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("AI returned an empty response for trivia.");
    }
    const parsedTrivia: WellnessTrivia = JSON.parse(text);
    // Basic validation to ensure the parsed object has the expected structure
    if (!parsedTrivia.question || !Array.isArray(parsedTrivia.options) || parsedTrivia.options.length === 0 || parsedTrivia.correctIndex === undefined || parsedTrivia.explanation === undefined) {
        throw new Error("AI returned malformed trivia data.");
    }
    return parsedTrivia;

  } catch (e) {
    console.error("Failed to fetch wellness trivia from AI:", e);
    // Re-throw the error to let the calling component handle it
    throw e;
  }
};
