import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { COORDINATOR_SYSTEM_INSTRUCTION, TOOLS } from "../constants";
import { ToolCallData } from "../types";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      // In a real app we might throw, but here we'll handle gracefully in UI
    }
    client = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-structure' });
  }
  return client;
};

export const sendMessageToCoordinator = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<{ text: string | null; toolCalls: ToolCallData[] }> => {
  const ai = getClient();
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: COORDINATOR_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: TOOLS }],
        temperature: 0.2, // Low temperature for deterministic delegation
      },
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.find(p => p.text)?.text || null;
    
    // Extract function calls
    const toolCalls: ToolCallData[] = [];
    const parts = candidate?.content?.parts || [];
    
    for (const part of parts) {
      if (part.functionCall) {
        toolCalls.push({
          name: part.functionCall.name,
          args: part.functionCall.args as Record<string, any>,
        });
      }
    }

    return { text, toolCalls };
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};
