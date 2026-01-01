
import { GoogleGenAI } from "@google/genai";
import { ImageData, AttributeType } from "./types";

const ATTRIBUTE_DIRECTIVES: Record<AttributeType, string> = {
  Expression: `
    - FACIAL MORPH: Synchronize the mouth shape, eye narrowing, and eyebrow position from PLATE B onto the face of PLATE A.`,
  Pose: `
    - SKELETAL OVERRIDE (CRITICAL): Discard PLATE A's original standing/sitting position. Reconstruct the person from PLATE A so they are standing, leaning, and gesturing EXACTLY like the person in PLATE B. This is a total physical reconfiguration.`,
  Lighting: `
    - GLOBAL ILLUMINATION: Transfer the exact light source angle, shadows, and color temperature from PLATE B onto the final rendered subject.`,
  Outfit: `
    - FASHION TRANSPLANT (CRITICAL): Completely remove all existing clothing from the person in PLATE A. Clothe them in the EXACT garments, fabrics, textures, and layers shown in PLATE B. Ensure the clothes fold and fit according to the new pose.`,
  Hairstyle: `
    - VOLUMETRIC GROOMING: Replace the hair of PLATE A with the volume, texture, and style from PLATE B.`,
  Mood: `
    - CINEMATIC GRADE: Apply the photographic style, grain, and color palette of PLATE B to the entire final output.`
};

export const transferAttributes = async (
  reference: ImageData,
  target: ImageData,
  attributes: AttributeType[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const attributeSection = attributes.length > 0 
    ? attributes.map(attr => ATTRIBUTE_DIRECTIVES[attr]).join("\n")
    : "Maintain PLATE A with zero modification.";

  /**
   * NEURAL FUSION PROTOCOL V14 (RECONSTRUCTION MASTER)
   * This prompt forces a radical reconstruction of the target identity into the donor's frame.
   */
  const systemPrompt = `
    ROLE: EXPERT NEURAL COMPOSITOR & FASHION RETOUCHER.
    
    TASK: GENERATIVE RE-PROJECTION. You are not "editing" an image; you are generating a NEW image of a specific person.

    INPUTS:
    - PLATE A (IDENTITY MASTER): This person's face (eyes, nose, mouth, chin, skin tone, unique marks) is the ONLY face allowed in the final image. Identity = "Subject Alpha".
    - PLATE B (STRUCTURE & FASHION MASTER): This image dictates the POSE, BODY TYPE, and CLOTHING. You MUST ignore the face of the person in PLATE B.

    OBJECTIVE:
    Generate a photorealistic image of "Subject Alpha" (from PLATE A) inhabiting the EXACT world, outfit, and body posture of the person in PLATE B.

    TRANSFORMATION RULES:
    ${attributeSection}

    STRICT OPERATIONAL GUIDELINES:
    1. FORCE POSE/OUTFIT: If Pose or Outfit is selected, you MUST NOT leave any traces of PLATE A's original clothes or stance. PLATE B is the structural blueprint.
    2. IDENTITY ANCHOR: The face in the output MUST be a perfect, high-fidelity match for the person in PLATE A.
    3. NO FACE BLENDING: Do not create a composite of the two faces. Face = 100% Plate A. Body/Clothes = 100% Plate B.
    4. BACKGROUND LOCK: Default to using the background from PLATE B to ensure the lighting and shadows on the new outfit look natural, but place the Subject Alpha (A) in it.
    5. ASPECT RATIO: ${target.aspectRatio || '1:1'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: "GENERATE_COMMAND: " + systemPrompt },
          { text: "SOURCE IDENTITY (PLATE A):" },
          {
            inlineData: {
              data: target.base64.split(',')[1],
              mimeType: target.mimeType,
            },
          },
          { text: "SKELETAL & CLOTHING BLUEPRINT (PLATE B):" },
          {
            inlineData: {
              data: reference.base64.split(',')[1],
              mimeType: reference.mimeType,
            },
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: target.aspectRatio || "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      throw new Error("Neural synthesis returned empty candidates.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image buffer found in neural response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Fusion Timeout or Logic Conflict: " + (error.message || "Unknown error"));
  }
};
