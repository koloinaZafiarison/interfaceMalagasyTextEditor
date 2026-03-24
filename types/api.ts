// API Request and Response Types for Malagasy Text Editor

// Spell Check
export interface SpellCheckRequest {
  text: string;
}

export interface SpellCheckSuggestion {
  original: string;
  suggestions: string[];
  position: {
    start: number;
    end: number;
  };
}

export interface SpellCheckResponse {
  corrections: SpellCheckSuggestion[];
}

// Lemmatization
export interface LemmatizationRequest {
  word: string;
}

export interface LemmatizationResponse {
  original: string;
  lemma: string;
  partOfSpeech?: string;
}

// Autocomplete
export interface AutocompleteRequest {
  text: string;
  cursorPosition: number;
}

export interface AutocompleteResponse {
  suggestions: string[];
  prefix: string;
}

// Translation
export interface TranslationRequest {
  text: string;
  direction: 'mg-fr' | 'fr-mg';
}

export interface TranslationResponse {
  original: string;
  translated: string;
  direction: 'mg-fr' | 'fr-mg';
}

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
