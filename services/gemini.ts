import { GoogleGenAI } from "@google/genai";
import { Climb, SetterStats } from "../types";

const API_KEY = process.env.API_KEY || ''; // Injected by environment

export const analyzeRoutesettingData = async (
  climbs: Climb[],
  setterStats: SetterStats[],
  startDate: Date,
  endDate: Date
): Promise<string> => {
  if (!API_KEY) {
    return "API Key is missing. Please configure the environment.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Summarize data for the prompt to save tokens
  const summary = {
    period: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    totalClimbs: climbs.length,
    setters: setterStats.map(s => ({
      name: s.name,
      count: s.totalClimbs,
      stewardshipHours: s.stewardshipHours,
      mostFreqGrade: Object.entries(s.gradeDistribution).sort((a,b) => b[1] - a[1])[0]?.[0]
    })),
    walls: Array.from(new Set(climbs.map(c => c.wall))).slice(0, 10), // Sample of walls
  };

  const prompt = `
    You are an expert Head Routesetter analyzing production data for a climbing gym.
    
    Context:
    We follow a "SMaC" (Specific, Methodical, Consistent) philosophy. We value "The Right Amount of Work" over just high volume.
    We are trying to identify "Invisible Labor" (Stewardship) and prevent burnout.

    Data Summary (JSON):
    ${JSON.stringify(summary, null, 2)}

    Task:
    Provide a concise, 3-bullet point executive summary for the leadership team.
    1. Comment on the overall team velocity and balance.
    2. Identify any potential burnout risks or setters who might be carrying too much load.
    3. Suggest one strategic focus for the next bi-weekly period (e.g., specific wall attention or grade gap).
    
    Keep the tone professional, encouraging, but analytical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI analysis. Please check your connection or API key.";
  }
};
