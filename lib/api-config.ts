// API Configuration for Malagasy Text Editor

//const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_BASE = https://malagasyapi2026.onrender.com/;

export const API_ENDPOINTS = {
  spellcheck: `${API_BASE}/api/orthographe/`,
  lemmatize: `${API_BASE}/api/lemmatisation/`,
  autocomplete: `${API_BASE}/api/autocomplete/`,
  sentimentCheck: `${API_BASE}/api/predict-sentiment/`,
  phonotactic: `${API_BASE}/api/phonotactique/`,
  tts: `${API_BASE}/api/tts/`,
  chatbot: `${API_BASE}/api/chatbot/`,
  translate: `${API_BASE}/translator/translate/`,
  
} as const;

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  retryDelay: 1000, // 1 second
};

export type ApiEndpoint = keyof typeof API_ENDPOINTS;
