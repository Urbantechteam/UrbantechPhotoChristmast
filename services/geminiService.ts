import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using Gemini 2.5 Flash Image.
 * @param base64Image The base64 string of the original image (without data:image/... prefix)
 * @param mimeType The mime type of the original image
 * @param prompt The instructions for editing
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image is returned but text is (e.g. refusal)
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
      throw new Error(`Gemini respondió solo con texto: ${textPart.text}`);
    }

    throw new Error("No se generó ninguna imagen válida.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};