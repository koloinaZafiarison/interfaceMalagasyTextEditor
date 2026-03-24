import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  TranslationRequest,
  TranslationResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Translate text between Malagasy and French
 */
export async function translate(
  text: string,
  direction: 'mg-fr' | 'fr-mg'
): Promise<ApiResponse<TranslationResponse>> {
  const request: TranslationRequest = { text, direction };
  const instant: ApiResponse<TranslationResponse> = {
    status: 'success',
    data: mockTranslate(text, direction),
  };

  const response = await Promise.race([
    apiPost<TranslationRequest, TranslationResponse>(
      API_ENDPOINTS.translate,
      request
    ),
    new Promise<ApiResponse<TranslationResponse>>((resolve) =>
      setTimeout(() => resolve(instant), 150)
    ),
  ]);

  if (response.status === 'success' && response.data) return response;
  return instant;
}

/**
 * Mock translation for development/demo purposes
 * This simulates the API response when the backend is not available
 */
export function mockTranslate(
  text: string,
  direction: 'mg-fr' | 'fr-mg'
): TranslationResponse {
  // Common Malagasy <-> French translations (for demo)
  const mgToFr: Record<string, string> = {
    'manao ahoana': 'bonjour / comment allez-vous',
    'misaotra': 'merci',
    'azafady': "s'il vous plaît",
    'veloma': 'au revoir',
    'eny': 'oui',
    'tsia': 'non',
    'fitiavana': 'amour',
    'fahendrena': 'sagesse',
    'fahalalana': 'connaissance',
    'fiainana': 'vie',
    'fanantenana': 'espoir',
    'tsara': 'bien / bon',
    'ratsy': 'mauvais',
    'lehibe': 'grand',
    'kely': 'petit',
    'vaovao': 'nouveau',
    'teny': 'mot / parole',
    'soratra': 'écriture',
    'boky': 'livre',
    'sekoly': 'école',
    'ankizy': 'enfant',
    'olona': 'personne',
    'trano': 'maison',
    'rano': 'eau',
    'hanina': 'nourriture',
    'andro': 'jour',
    'alina': 'nuit',
    'masoandro': 'soleil',
    'volana': 'lune / mois',
    'tany': 'terre / pays',
    'lanitra': 'ciel',
  };

  const frToMg: Record<string, string> = {};
  for (const [mg, fr] of Object.entries(mgToFr)) {
    // Handle multiple translations
    const frWords = fr.split(' / ');
    frWords.forEach((frWord) => {
      frToMg[frWord.toLowerCase()] = mg;
    });
  }

  const cleanText = text.toLowerCase().trim();

  if (direction === 'mg-fr') {
    const translation = mgToFr[cleanText];
    return {
      original: text,
      translated: translation || `[Traduction non disponible pour: "${text}"]`,
      direction,
    };
  } else {
    const translation = frToMg[cleanText];
    return {
      original: text,
      translated: translation || `[Dikanteny tsy hita ho an'ny: "${text}"]`,
      direction,
    };
  }
}
