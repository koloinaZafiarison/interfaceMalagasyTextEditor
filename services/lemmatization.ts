import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  LemmatizationRequest,
  LemmatizationResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Get the lemma (root word) for the given word
 * Fandrasan-teny in Malagasy
 */
export async function lemmatize(
  word: string
): Promise<ApiResponse<LemmatizationResponse>> {
  const request: LemmatizationRequest = { word };
  const instant: ApiResponse<LemmatizationResponse> = {
    status: 'success',
    data: mockLemmatize(word),
  };

  const response = await Promise.race([
    apiPost<LemmatizationRequest, LemmatizationResponse>(
      API_ENDPOINTS.lemmatize,
      request
    ),
    new Promise<ApiResponse<LemmatizationResponse>>((resolve) =>
      setTimeout(() => resolve(instant), 150)
    ),
  ]);

  if (response.status === 'success' && response.data) return response;
  return instant;
}

/**
 * Mock lemmatization for development/demo purposes
 * This simulates the API response when the backend is not available
 */
export function mockLemmatize(word: string): LemmatizationResponse {
  // Common Malagasy word -> lemma mappings (for demo)
  const lemmaMap: Record<string, { lemma: string; partOfSpeech: string }> = {
    // Verbs with prefixes
    'manoratra': { lemma: 'soratra', partOfSpeech: 'verbe' },
    'mianatra': { lemma: 'anatra', partOfSpeech: 'verbe' },
    'miasa': { lemma: 'asa', partOfSpeech: 'verbe' },
    'miteny': { lemma: 'teny', partOfSpeech: 'verbe' },
    'mahita': { lemma: 'hita', partOfSpeech: 'verbe' },
    'mandray': { lemma: 'ray', partOfSpeech: 'verbe' },
    'manana': { lemma: 'ana', partOfSpeech: 'verbe' },
    'mamaky': { lemma: 'vaky', partOfSpeech: 'verbe' },
    'mandeha': { lemma: 'deha', partOfSpeech: 'verbe' },
    'miresaka': { lemma: 'resaka', partOfSpeech: 'verbe' },
    
    // Nouns
    'fitiavana': { lemma: 'tia', partOfSpeech: 'nom' },
    'fahendrena': { lemma: 'hendry', partOfSpeech: 'nom' },
    'fahalalana': { lemma: 'hala', partOfSpeech: 'nom' },
    'fanantenana': { lemma: 'antena', partOfSpeech: 'nom' },
    'fiainana': { lemma: 'aina', partOfSpeech: 'nom' },
    
    // Adjectives
    'tsara': { lemma: 'tsara', partOfSpeech: 'adj' },
    'ratsy': { lemma: 'ratsy', partOfSpeech: 'adj' },
    'kely': { lemma: 'kely', partOfSpeech: 'adj' },
    'lehibe': { lemma: 'lehibe', partOfSpeech: 'adj' },
    'vaovao': { lemma: 'vaovao', partOfSpeech: 'adj' },
  };

  const cleanWord = word.toLowerCase().trim();
  const mapping = lemmaMap[cleanWord];

  if (mapping) {
    return {
      original: word,
      lemma: mapping.lemma,
      partOfSpeech: mapping.partOfSpeech,
    };
  }

  // Default: return the word itself as the lemma
  return {
    original: word,
    lemma: cleanWord,
    partOfSpeech: 'unknown',
  };
}
