
import { GoogleGenAI } from "@google/genai";
import { ImageData, AttributeType } from "./types";

export const transferAttributes = async (
  reference: ImageData,
  target: ImageData,
  attributes: AttributeType[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const attributeDescription = attributes.join(", ");
  
  // Explicitly label images to prevent index confusion
  // We send Target first as it is the "Base" for the generation
  const prompt = `
    NEURAL FUSION DIRECTIVE:
    
    You are given two images.
    IMAGE 1 (PRIMARY IDENTITY): This is the TARGET. This person's identity, face structure, skin texture, and bone geometry MUST BE PRESERVED 100%.
    IMAGE 2 (ATTRIBUTE SOURCE): This is the REFERENCE. Extract ONLY the ${attributeDescription} from this person.
    
    GOAL:
    Generate a new image that is a photorealistic modification of the person in IMAGE 1. 
    They must be transformed to adopt the ${attributeDescription} seen in IMAGE 2.
    
    REQUIRED BEHAVIOR:
    - If "Expression" is selected: Force the person from IMAGE 1 to mimic the EXACT facial muscle movements (mouth shape, eye squint, brow position) of IMAGE 2.
    - If "Pose" is selected: Rotate the head and neck of the person from IMAGE 1 to match the orientation in IMAGE 2.
    - If "Lighting" is selected: Apply the light source direction and color grading from IMAGE 2 onto the person from IMAGE 1.
    
    STRICT PROHIBITION:
    - DO NOT return the person from IMAGE 2.
    - DO NOT perform a simple face swap.
    - The output MUST clearly be the individual from IMAGE 1, just performing the action or being in the state of IMAGE 2.
    
    OUTPUT:
    Return only the resulting image. No text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            // PART 1: The Target (The person we keep)
            inlineData: {
              data: target.base64.split(',')[1],
              mimeType: target.mimeType,
            },
          },
          {
            // PART 2: The Reference (The attributes we take)
            inlineData: {
              data: reference.base64.split(',')[1],
              mimeType: reference.mimeType,
            },
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Neural synthesis returned no visual data. Please try a different combination.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429")) throw new Error("Processing queue full. Please wait 10 seconds.");
    throw error;
  }
};
