
export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export type AttributeType = 
  | 'Expression' 
  | 'Pose' 
  | 'Lighting' 
  | 'Accessories' 
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
