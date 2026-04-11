// API Configuration for Malagasy Text Editor

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  spellcheck: `${API_BASE}/api/orthographe/`,
  lemmatize: `${API_BASE}/api/lemmatize/`,
  autocomplete: `${API_BASE}/api/autocomplete/`,
  sentimentCheck: `${API_BASE}/api/predict-sentiment/`,
  phonotactic: `${API_BASE}/api/phonotactic-check/`,
  tts: `${API_BASE}/api/tts/`,
  chatbot: `${API_BASE}/api/chatbot/`,
  translate: 'http://127.0.0.1:8000/translator/translate/',
  
} as const;

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  retryDelay: 1000, // 1 second
};

export type ApiEndpoint = keyof typeof API_ENDPOINTS;
