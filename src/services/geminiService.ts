import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SongRecognitionResult {
  songTitle: string;
  artist: string;
  recognizedLyrics: string | null;
  matchConfidence: number;
  lyricClarity: number;
  searchMethod: string;
  explanation: string;
}

export async function recognizeSong(audioBase64: string, mimeType: string): Promise<SongRecognitionResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this audio clip which contains humming, singing, or instrumental melody.
  
  1. Extract recognized lyrics/speech (STT). If no clear speech is found, set recognizedLyrics to null.
  2. Evaluate lyricClarity (0.0 to 1.0).
  3. Analyze the melody (pitch/rhythm) to identify the song.
  
  Decision Logic for Search:
  - If lyricClarity > 0.6 and recognizedLyrics is meaningful, prioritize lyrics (Primary Key).
  - If lyricClarity <= 0.6 or recognizedLyrics is "mumbling" / "unclear", prioritize melody (80%+ weight based on pitch and rhythm).
  - If both are present and clear, perform a Hybrid Search (use lyrics as a filter, then melody for final match).
  
  Return the result exactly as a JSON object with these keys:
  - songTitle (string)
  - artist (string)
  - recognizedLyrics (string or null)
  - matchConfidence (number 0-1)
  - lyricClarity (number 0-1)
  - searchMethod (string, describe the logic used, e.g., "Lyric-based", "Melody-based", or "Hybrid Search")
  - explanation (string, brief explanation of how you found the result)
  
  If the song cannot be identified, return a JSON with null values but with an explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            songTitle: { type: Type.STRING },
            artist: { type: Type.STRING },
            recognizedLyrics: { type: Type.STRING, nullable: true },
            matchConfidence: { type: Type.NUMBER },
            lyricClarity: { type: Type.NUMBER },
            searchMethod: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["songTitle", "artist", "matchConfidence", "lyricClarity", "searchMethod", "explanation"],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini recognition error:", error);
    throw new Error("노래를 분석하는 중 오류가 발생했습니다.");
  }
}
