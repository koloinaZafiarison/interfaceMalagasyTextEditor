import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type { TTSRequest, TTSResponse, ApiResponse } from '@/types/api';

/**
 * Convert text to speech using the backend API
 */
export async function textToSpeech(
  text: string,
  voice?: string
): Promise<ApiResponse<TTSResponse>> {
  const request: TTSRequest = { text, voice };
  return apiPost<TTSRequest, TTSResponse>(API_ENDPOINTS.tts, request);
}

/**
 * Use the Web Speech API for text-to-speech
 * This is a fallback when the backend API is not available
 */
export function speakWithWebSpeech(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options.onError?.('Speech synthesis not supported in this browser');
    return null;
  }

  const { rate = 0.9, pitch = 1, volume = 1, onEnd, onError } = options;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  // Try to find a French voice (closest to Malagasy phonetics)
  // or use the default voice
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(
    (v) => v.lang.startsWith('fr') || v.lang === 'fr-FR'
  );
  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => onError?.(event.error);

  window.speechSynthesis.speak(utterance);

  return utterance;
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is currently speaking
 */
export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Get available voices for TTS
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.getVoices();
  }
  return [];
}

/**
 * Load voices (they may not be immediately available)
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}
