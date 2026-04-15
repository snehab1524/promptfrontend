
import { GoogleGenAI } from "@google/genai";

// Always use named parameter for apiKey and direct process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIFeedback = async (userPrompt: string, task: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is learning Prompt Engineering. 
      Task: ${task}
      User's Attempt: "${userPrompt}"
      Evaluate this prompt. Is it effective? Give 1 pro and 1 con in a friendly, encouraging way (max 50 words).`,
      config: {
        systemInstruction: "You are a professional Prompt Engineering Coach. Be concise, encouraging, and educational."
      }
    });
    // Use the .text property directly, do not call it as a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Great effort! Keep practicing to refine your skills.";
  }
};
