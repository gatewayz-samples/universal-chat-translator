export interface ChatMessage {
  id: string;
  user: 'A' | 'B';
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  timestamp: Date;
  isTranslating?: boolean;
}

export interface UserSettings {
  user: 'A' | 'B';
  language: string;
  explainMode: boolean;
  model: string;
}

export const SUPPORTED_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Korean',
  'Arabic',
  'Hindi',
  'Turkish',
  'Dutch',
  'Polish',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Greek',
  'Hebrew',
  'Thai',
  'Vietnamese',
  'Indonesian',
  'Malay',
  'Filipino',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
