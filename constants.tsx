
import { Attribute } from './types';

export const ATTRIBUTES: Attribute[] = [
  { 
    id: 'Expression', 
    label: 'Expression', 
    icon: 'fa-face-laugh-wink', 
    description: 'Map the exact facial muscle movements, mouth shape, and eye state from the reference.' 
  },
  { 
    id: 'Pose', 
    label: 'Pose & Tilt', 
    icon: 'fa-user-ninja', 
    description: 'Re-orient the head, neck, and shoulder alignment to match the reference angle.' 
  },
  { 
    id: 'Lighting', 
    label: 'Atmosphere', 
    icon: 'fa-sun', 
    description: 'Transfer the shadow depth, light direction, and color grade of the reference scene.' 
  },
  { 
    id: 'Accessories', 
    label: 'Add-ons', 
    icon: 'fa-glasses', 
    description: 'Transfer eyewear, headwear, or facial jewelry seamlessly onto the target.' 
  },
  { 
    id: 'Hairstyle', 
    label: 'Hair Stylist', 
    icon: 'fa-scissors', 
    description: 'Adopt the hair volume, texture, cut, and color while fitting it to the target face.' 
  },
  { 
    id: 'Mood', 
    label: 'Visual Vibe', 
    icon: 'fa-palette', 
    description: 'Capture the photographic style, grain, and artistic essence of the reference.' 
  }
];

export const LOADING_MESSAGES = [
  "Mapping facial geometry...",
  "Extracting muscle micro-expressions...",
  "Synthesizing lighting environment...",
  "Injecting reference characteristics...",
  "Balancing identity preservation...",
  "Rendering final composition..."
];
