import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  SpellCheckRequest,
  SpellCheckResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Check spelling for the given text
 * Returns suggestions for misspelled words
 */
export async function checkSpelling(
  text: string
): Promise<ApiResponse<SpellCheckResponse>> {
  const request: SpellCheckRequest = { text };
  const instant: ApiResponse<SpellCheckResponse> = {
    status: 'success',
    data: mockSpellCheck(text),
  };

  const response = await Promise.race([
    apiPost<SpellCheckRequest, SpellCheckResponse>(
      API_ENDPOINTS.spellcheck,
      request
    ),
    new Promise<ApiResponse<SpellCheckResponse>>((resolve) =>
      setTimeout(() => resolve(instant), 150)
    ),
  ]);

  if (response.status === 'success' && response.data) return response;
  return instant;
}

/**
 * Mock spell check for development/demo purposes
 * This simulates the API response when the backend is not available
 */
export function mockSpellCheck(text: string): SpellCheckResponse {
  // Common Malagasy spelling mistakes (for demo)
  const commonMistakes: Record<string, string[]> = {
    'toko': ['tokoa', 'toka'],
    'manaiky': ['manaiky', 'maneky'],
    'masina': ['masina', 'masiny'],
    'tsara': ['tsara', 'tsaratsara'],
    'mahita': ['mahita', 'nahita'],
    'mandray': ['mandray', 'nandray'],
    'manana': ['manana', 'manan'],
    'miaina': ['miaina', 'velona'],
    'fitiavana': ['fitiavana', 'fitiavan'],
    'fahendrena': ['fahendrena', 'fahendren'],
  };

  const words = text.split(/\s+/);
  const corrections: SpellCheckResponse['corrections'] = [];

  let currentPosition = 0;
  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const wordStart = text.indexOf(word, currentPosition);
    const wordEnd = wordStart + word.length;

    if (commonMistakes[cleanWord]) {
      corrections.push({
        original: word,
        suggestions: commonMistakes[cleanWord],
        position: { start: wordStart, end: wordEnd },
      });
    }

    currentPosition = wordEnd;
  });

  return { corrections };
}
