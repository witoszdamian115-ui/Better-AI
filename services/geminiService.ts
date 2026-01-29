
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Role, Message, AppSettings } from "../types";

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const sendMessageStream = async (
  history: Message[],
  userInput: string,
  settings: AppSettings,
  imageData?: { mimeType: string; data: string },
  location?: { latitude: number; longitude: number }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(msg => ({
    role: msg.role === Role.USER ? 'user' : 'model',
    parts: msg.parts.map(p => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: p.inlineData };
      return { text: '' };
    })
  }));

  contents.push({
    role: 'user',
    parts: [{ text: userInput }, ...(imageData ? [{ inlineData: imageData }] : [])]
  });

  try {
    return await ai.models.generateContentStream({
      model: settings.model,
      contents,
      config: {
        systemInstruction: settings.systemInstruction,
        temperature: settings.personality === 'creative' ? 1.2 : settings.personality === 'precise' ? 0.2 : 0.7,
        thinkingConfig: { thinkingBudget: settings.thinkingBudget || (settings.personality === 'precise' ? 16000 : 0) },
        tools: [{ googleSearch: {} }]
      }
    });
  } catch (err) {
    throw err;
  }
};

export const generateSuggestions = async (message: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: "${message.slice(0, 500)}". Suggest 3 very short follow-up buttons for the user. JSON array of strings only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } }
        }
      }
    });
    // Guidelines say Type.OBJECT cannot be empty, must contain properties.
    // The previous prompt was asking for a JSON array of strings, 
    // but the implementation was using Type.ARRAY as root which is supported.
    // Let's refine for stability.
    return JSON.parse(response.text || "[]");
  } catch {
    return ["Powiedz więcej", "Wyjaśnij to", "Co dalej?"];
  }
};

export const optimizePrompt = async (draft: string): Promise<string> => {
  if (!draft.trim()) return draft;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite this prompt to be high-performance for an LLM: "${draft}"`,
      // Set thinkingBudget to 0 when using maxOutputTokens to reserve space for final response as per guidelines.
      config: { maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim() || draft;
  } catch {
    return draft;
  }
};

export const speakText = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    });
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("Audio generation failed");
    return audioData;
  } catch (err) {
    throw err;
  }
};

export const generateImage = async (prompt: string, retry: boolean = true): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const finalPrompt = retry ? `Generate a photorealistic, high-resolution image of: ${prompt}` : prompt;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: finalPrompt }] }
    });
    
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts || []) {
        if (part.inlineData?.data) return part.inlineData.data;
      }
    }
    
    if (retry) return generateImage(prompt, false);
    throw new Error("Model returned no image data.");
  } catch (err: any) {
    throw err;
  }
};

export const generateTitle = async (message: string, model: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Short title for: "${message}". Max 3 words.`,
      // Set thinkingBudget to 0 when using maxOutputTokens to reserve space for final response as per guidelines.
      config: { maxOutputTokens: 50, thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim() || "Nowy Czat";
  } catch { return "Nowy Czat"; }
};
