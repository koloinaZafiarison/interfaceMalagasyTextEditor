// API Request and Response Types for Malagasy Text Editor

// Spell Check
export interface SpellCheckRequest {
  texte: string;
}

export type SpellCheckApiResponse = {
  texte: string;
  corrections: Record<string, [string, number][]>;
};

export type SpellCheckUIItem = {
  original: string;
  suggestions: string[];
};

export type SpellSuggestion = {
  word: string;
  score: number;
};

// Lemmatization
export interface LemmatizationRequest {
  word: string;
}

export interface LemmatizationResponse {
  original: string;
  lemma: string;
  partOfSpeech?: string;
}

// Lemmatization for text (backend endpoint)
export interface LemmatizationTextRequest {
  texte: string;
}

export interface LemmaInfo {
  racine: string;
  methode: string;
}

export interface LemmatizationTextResponse {
  texte: string;
  lemmes: Record<string, LemmaInfo>;
}

// Autocomplete
export interface AutocompleteRequest {
  text: string;
  top_k: number;
}

export interface AutocompleteResponse {
  suggestions: string[];
  prefix: string;
}

// Sentiment Check
export interface SentimentCheckRequest {
  text: string;
}

export interface SentimentCheckResponse {
  text: string;
  sentiment: string;
}

// Translation
export interface TranslationRequest {
  text: string;
  direction: 'mg-fr' | 'fr-mg';
}

export type TranslationResponse = {
  fr: string;
  mg: string;
  en: string;
  source : string;
  input : string
};

// Phonotactic Check
export interface PhonotacticError {
  pattern: string;
  position: {
    start: number;
    end: number;
  };
  message: string;
}

export interface PhonotacticCheckRequest {
  text: string;
}

export interface PhonotacticCheckResponse {
  errors: PhonotacticError[];
  isValid: boolean;
}

// Text-to-Speech
export interface TTSRequest {
  text: string;
  voice?: string;
}

export interface TTSResponse {
  audioUrl?: string;
  audio?: Blob;
}

// Chatbot
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotRequest {
  message: string;
  context?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}
