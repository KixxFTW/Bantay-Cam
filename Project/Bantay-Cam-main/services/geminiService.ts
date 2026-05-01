
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SecurityStatus, ErrorType, ErrorSeverity } from "../types";
import { errorService } from "./errorService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const CRITICAL_HAZARD_PATTERN = /\b(knife|gun|fire|smoke|firearm|pistol|revolver|rifle|shotgun)\b/i;
const hasCriticalThreatText = (value: string | undefined) =>
  Boolean(value && CRITICAL_HAZARD_PATTERN.test(value));

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
          { text: `Analyze Bantay Cam frame. Context: ${sensorContext}. Identify physical hazards, weapons, or suspicious behavior.
For demonstration mode, treat visible depictions of weapons (real object, printed photo, poster, or weapon shown on a phone/laptop screen) as valid threat indicators.
Return JSON.` },
        ],
      },
      config: {
        systemInstruction: `You are Bantay Cam AI, a professional-grade weapon
and threat detection system deployed in Filipino commercial and public
spaces. Your sole purpose is to analyze security camera frames with
extreme precision and flag any presence of weapons or dangerous objects.

WEAPON DETECTION PRIORITY LIST (scan for these first):
- Firearms: handguns, pistols, revolvers, rifles, shotguns,
  any gun-shaped object
- Bladed weapons: knives, bolos, balisong (butterfly knife),
  ice picks, machetes, any blade longer than 10cm
- Improvised weapons: broken bottles, metal pipes, bats, clubs
- Explosive indicators: wires, packages, suspicious bags
  left unattended
- Other: brass knuckles, tasers, any object being wielded aggressively

BEHAVIORAL THREAT SIGNALS (combine with object detection):
- Person concealing something under clothing or in a bag
- Aggressive pointing of an object toward another person
- Defensive posture from bystanders (hands up, backing away)
- Unusual crowding or altercation body language

RESPONSE RULES:
1. If ANY weapon is visible even partially return status DANGER immediately
2. If weapon-shaped object is ambiguous but suspicious return status CAUTION
3. Only return status SAFE if scene is clearly free of weapons and threats
4. NEVER downgrade a weapon sighting to CAUTION or SAFE
5. Be specific in hazards array - name weapon type and its location
   in frame
6. confidence must reflect certainty of weapon presence 0 to 100
7. action must be an immediate actionable security instruction
8. For demonstration, weapon depictions in images/screens still count as threats

Return ONLY valid JSON matching the response schema.`,
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
    const result = JSON.parse(cleanedText) as AnalysisResult;
    const hasCriticalHazard = (result.hazards || []).some(hasCriticalThreatText);
    const hasCriticalAction = hasCriticalThreatText(result.action);
    
    return {
      ...result,
      status: hasCriticalHazard || hasCriticalAction ? SecurityStatus.DANGER : result.status,
      timestamp: new Date().toLocaleString(),
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
    timestamp: new Date().toLocaleString(),
    error: msg
  };
}
