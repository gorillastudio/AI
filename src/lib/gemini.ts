import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;
function getAIInstance() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export async function analyzeTestImage(base64Image: string, mimeType: string) {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      studentNumber: { type: Type.NUMBER, description: "The student's number written at the top right" },
      answers: {
        type: Type.OBJECT,
        description: "The student's answers for questions 1 to 10. Keys are question numbers (1-10), values are the chosen letter (a, b, c, or d).",
        properties: {
          "1": { type: Type.STRING },
          "2": { type: Type.STRING },
          "3": { type: Type.STRING },
          "4": { type: Type.STRING },
          "5": { type: Type.STRING },
          "6": { type: Type.STRING },
          "7": { type: Type.STRING },
          "8": { type: Type.STRING },
          "9": { type: Type.STRING },
          "10": { type: Type.STRING },
        }
      },
      error: { type: Type.STRING, description: "If the image is not readable or not a test, provide an error message here." }
    }
  };

  try {
    const aiInstance = getAIInstance();
    const response = await aiInstance.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          }
        },
        {
          text: "Analyze this multiple-choice test. Extract the student's 'Number' from the top right. Then, extract the student's answers for questions 1 to 10. The answers will be indicated by circled letters, ticks, or crosses over the letters (a, b, c, or d). Return the result as a JSON object. If the image is blurry, unreadable, or not a test, return an error message in the error field."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return { error: "Failed to analyze image" };
  }
}
