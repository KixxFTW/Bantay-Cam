
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SecurityStatus, ErrorType, ErrorSeverity } from "../types";
import { errorService } from "./errorService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFrame = async (base64Image: string, sensorContext: string): Promise<AnalysisResult> => {
  if (!base64Image || base64Image.length < 100) {
    return createErrorResult("Invalid Image Data", "Ensure camera is functional");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: `Analyze Bantay Cam frame. Context: ${sensorContext}. Identify physical hazards, weapons, or suspicious behavior. Return JSON.` },
        ],
      },
      config: {
        systemInstruction: "You are Bantay Cam AI, a specialized safety detection system. Monitor for threats (weapons, fires, falls, hazards). Return structured JSON matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: [SecurityStatus.SAFE, SecurityStatus.CAUTION, SecurityStatus.DANGER] },
            hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
            action: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["status", "hazards", "action", "confidence"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");

    const cleanedText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const result = JSON.parse(cleanedText);
    
    return {
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    };

  } catch (err: any) {
    errorService.log({
      type: ErrorType.AI,
      severity: ErrorSeverity.MEDIUM,
      message: err.message || "AI Analysis Failed",
      context: { sensorContext },
      actionRequired: "Check API key or network"
    });

    return createErrorResult("AI Analysis Interrupted", "Check settings and connectivity");
  }
};

function createErrorResult(msg: string, action: string): AnalysisResult {
  return {
    status: SecurityStatus.CAUTION,
    hazards: [msg],
    action: action,
    confidence: 0,
    timestamp: new Date().toLocaleTimeString(),
    error: msg
  };
}
