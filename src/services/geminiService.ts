
import { GoogleGenAI, Type } from "@google/genai";
import { TriageLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTriage = async (symptoms: string) => {
  if (!symptoms || symptoms.length < 5) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert clinical triage system. Analyze the following text: "${symptoms}".
                 
                 Step 1: Determine if the text describes any medical symptoms, injuries, pain, or health conditions. If it is random words, nonsense, or non-medical, set isValidMedicalSymptom to false.
                 
                 Step 2: If valid, categorize into: 
                 - EMERGENCY: Immediate life-threat (e.g., cardiac arrest, unconscious, massive hemorrhage).
                 - CRITICAL: Severe/High risk (e.g., severe chest pain, major fracture, respiratory distress).
                 - INTERMEDIATE: Urgent but stable (e.g., high fever, moderate pain, minor injury).
                 - NORMAL: Routine/Non-urgent (e.g., common cold, routine checkup, mild discomfort).
                 
                 Step 3: Assign urgencyScale (1-10) and calculate triageScore (1-100).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidMedicalSymptom: {
              type: Type.BOOLEAN,
              description: "True if the text is a medical concern, false if random/gibberish.",
            },
            level: {
              type: Type.STRING,
              description: "EMERGENCY, CRITICAL, INTERMEDIATE, or NORMAL",
            },
            score: {
              type: Type.NUMBER,
              description: "1-100 score",
            },
            justification: {
              type: Type.STRING,
              description: "Short clinical reasoning",
            },
            urgencyScale: {
              type: Type.NUMBER,
              description: "1-10 scale",
            }
          },
          required: ["isValidMedicalSymptom", "level", "score", "justification", "urgencyScale"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    if (!result.isValidMedicalSymptom) {
      return { isValid: false };
    }

    return {
      isValid: true,
      level: (result.level as TriageLevel) || TriageLevel.NORMAL,
      score: result.score || 30,
      justification: result.justification || "Clinical assessment complete.",
      urgencyScale: result.urgencyScale || 3
    };
  } catch (error) {
    console.error("AI Triage Analysis failed:", error);
    return null;
  }
};
