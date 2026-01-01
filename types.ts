
export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export type AttributeType = 
  | 'Expression' 
  | 'Pose' 
  | 'Lighting' 
  | 'Outfit' 
  | 'Hairstyle' 
  | 'Mood';

export interface Attribute {
  id: AttributeType;
  label: string;
  icon: string;
  description: string;
}

export interface GenerationResult {
  imageUrl: string;
  timestamp: number;
}
