import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, HistoryItem } from "../types";

// Using the latest flash model for multimodal capabilities
const MODEL_NAME = "gemini-flash-latest";

const bilingualSchema = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING },
    az: { type: Type.STRING },
  },
  required: ["en", "az"],
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallAssessment: {
      type: Type.OBJECT,
      properties: {
        summary: bilingualSchema,
        clarityRating: { type: Type.STRING, enum: ["Clear", "Mostly Clear", "Needs Work"] },
        mainStrength: bilingualSchema,
        priorityFocus: bilingualSchema,
      },
      required: ["summary", "clarityRating", "mainStrength", "priorityFocus"],
    },
    pronunciation: {
      type: Type.OBJECT,
      properties: {
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              error: { type: Type.STRING },
              example: { type: Type.STRING },
            },
            required: ["error", "example"],
          },
        },
        suggestions: { type: Type.ARRAY, items: bilingualSchema },
        score: { type: Type.NUMBER, description: "Score from 1 to 10" },
      },
      required: ["issues", "suggestions", "score"],
    },
    grammar: {
      type: Type.OBJECT,
      properties: {
        errors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              correction: { type: Type.STRING },
              explanation: bilingualSchema,
            },
            required: ["original", "correction", "explanation"],
          },
        },
        patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
        score: { type: Type.NUMBER, description: "Score from 1 to 10" },
      },
      required: ["errors", "patterns", "score"],
    },
    vocabulary: {
      type: Type.OBJECT,
      properties: {
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phrase: { type: Type.STRING },
              betterAlternative: { type: Type.STRING },
              reason: bilingualSchema,
            },
            required: ["phrase", "betterAlternative", "reason"],
          },
        },
        excellentUsage: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestions: { type: Type.ARRAY, items: bilingualSchema },
        score: { type: Type.NUMBER, description: "Score from 1 to 10" },
      },
      required: ["issues", "excellentUsage", "suggestions", "score"],
    },
    fluency: {
      type: Type.OBJECT,
      properties: {
        assessment: bilingualSchema,
        score: { type: Type.NUMBER, description: "Score from 1 to 10" },
      },
      required: ["assessment", "score"],
    },
    correctedVersion: { type: Type.STRING },
    actionItems: { type: Type.ARRAY, items: bilingualSchema },
    transcription: { type: Type.STRING },
  },
  required: [
    "overallAssessment",
    "pronunciation",
    "grammar",
    "vocabulary",
    "fluency",
    "correctedVersion",
    "actionItems",
    "transcription",
  ],
};

const generateSystemPrompt = (historyStr: string) => `
You are an expert English Speaking Coach for B2-level learners.
Your user is an Azerbaijani speaker named Khalid who wants to improve his English speaking skills.

HISTORY CONTEXT (Use this to track progress):
${historyStr || "No previous session history available."}

INSTRUCTIONS:
Analyze the audio recording provided. 
1. **Pronunciation**: Look for Azerbaijani-influenced patterns (/w/ vs /v/, /θ/ vs /s/).
2. **Grammar**: Identify B2 errors.
3. **Vocabulary**: Suggest native-like expressions.
4. **Fluency**: Evaluate flow.

**PROGRESS TRACKING**:
- If the user repeats errors mentioned in the history, be stricter and point out the lack of progress.
- If the user fixed previous issues, explicitly praise the improvement in the summary.

**LANGUAGE**:
- The user wants to read feedback in both English (en) and Azerbaijani (az).
- For all 'explanation', 'reason', 'suggestion', and 'assessment' fields, provide BOTH languages.
- **IMPORTANT**: Keep the *example sentences*, *corrected versions*, and *original errors* in English. Only translate the instructional text/reasoning.

The output MUST be in JSON format matching the provided schema.
`;

export const analyzeAudio = async (audioBlob: Blob, history: HistoryItem[]): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format history for the prompt
  const recentHistory = history.slice(0, 5).map((h, i) => 
    `Session ${i+1} (${new Date(h.date).toLocaleDateString()}): Priority Focus was "${h.priorityFocus || 'General'}". Summary: ${h.summary}`
  ).join('\n');

  // Convert Blob to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const mimeType = audioBlob.type || "audio/webm";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: "Analyze this practice session.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: generateSystemPrompt(recentHistory),
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text) as AnalysisResult;
    data.timestamp = new Date().toISOString();
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};