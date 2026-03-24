import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  AutocompleteRequest,
  AutocompleteResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Get autocomplete suggestions for the current text context
 */
export async function getAutocompleteSuggestions(
  text: string,
  cursorPosition: number
): Promise<ApiResponse<AutocompleteResponse>> {
  const request: AutocompleteRequest = { text, cursorPosition };
  const instant: ApiResponse<AutocompleteResponse> = {
    status: 'success',
    data: mockAutocomplete(text, cursorPosition),
  };

  const response = await Promise.race([
    apiPost<AutocompleteRequest, AutocompleteResponse>(
      API_ENDPOINTS.autocomplete,
      request
    ),
    new Promise<ApiResponse<AutocompleteResponse>>((resolve) =>
      setTimeout(() => resolve(instant), 150)
    ),
  ]);

  if (response.status === 'success' && response.data) return response;
  return instant;
}

/**
 * Mock autocomplete for development/demo purposes
 * This simulates the API response when the backend is not available
 */
export function mockAutocomplete(
  text: string,
  cursorPosition: number
): AutocompleteResponse {
  // Get the last word being typed
  const textBeforeCursor = text.substring(0, cursorPosition);
  const words = textBeforeCursor.split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase() || '';

  // Common Malagasy word completions (for demo)
  const completions: Record<string, string[]> = {
    'man': ['manoratra', 'manana', 'mandray', 'mandeha', 'manaiky'],
    'mi': ['miasa', 'mianatra', 'miteny', 'miresaka', 'miaina'],
    'fa': ['fahendrena', 'fahalalana', 'fanantenana', 'fandraisana'],
    'fi': ['fitiavana', 'fiainana', 'fiaraha-monina', 'fianarana'],
    'ts': ['tsara', 'tsaratsara', 'tsisy', 'tsy'],
    'ma': ['manoratra', 'masina', 'mahita', 'mahay', 'mamaky'],
    'ho': ['ho avy', 'ho tsara', 'ho ela', 'ho any'],
    'an': ['ankehitriny', 'anio', 'any', 'antso'],
  };

  // Find matching prefix
  for (const [prefix, suggestions] of Object.entries(completions)) {
    if (lastWord.startsWith(prefix) && lastWord.length >= 2) {
      const filtered = suggestions.filter(
        (s) => s.startsWith(lastWord) && s !== lastWord
      );
      if (filtered.length > 0) {
        return {
          suggestions: filtered,
          prefix: lastWord,
        };
      }
    }
  }

  // Phrase completions based on context
  const phraseCompletions: Record<string, string[]> = {
    'mba': ['mba ho tsara', 'mba hahasoa', 'mba hanome'],
    'amin': ["amin'ny", "amin'izao fotoana izao"],
    'izany': ['izany hoe', 'izany no'],
    'raha': ['raha tsy izany', 'raha mbola'],
  };

  for (const [trigger, phrases] of Object.entries(phraseCompletions)) {
    if (lastWord === trigger) {
      return {
        suggestions: phrases,
        prefix: trigger,
      };
    }
  }

  return {
    suggestions: [],
    prefix: lastWord,
  };
}
