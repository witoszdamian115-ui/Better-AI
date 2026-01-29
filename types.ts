
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  thought?: string; 
}

export interface GroundingChunk {
  web?: { uri: string; title: string; };
  maps?: { uri: string; title: string; };
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: number;
  groundingChunks?: GroundingChunk[];
  reaction?: 'like' | 'dislike' | null;
  isImage?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  thinking?: string;
  suggestions?: string[];
  metrics?: {
    latency: number;
    tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export type AccentTheme = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
export type Personality = 'balanced' | 'creative' | 'precise' | 'fast';

export interface AppSettings {
  model: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
  thinkingBudget: number;
  systemInstruction: string;
  temperature: number;
  theme: AccentTheme;
  shareLocation: boolean;
  voiceName: string;
  personality: Personality;
  isZenMode: boolean;
  enableHaptics: boolean;
}
