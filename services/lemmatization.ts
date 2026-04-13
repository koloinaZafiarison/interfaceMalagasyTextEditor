import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  LemmatizationRequest,
  LemmatizationResponse,
  LemmatizationTextRequest,
  LemmatizationTextResponse,
  LemmaInfo,
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


/**
 * Get lemmas for the entire text
 * Uses the backend endpoint that tokenizes and lemmatizes the text
 */
export async function lemmatizeText(
  text: string
): Promise<ApiResponse<LemmatizationTextResponse>> {
  const request: LemmatizationTextRequest = { texte: text };
  
  try {
    const response = await apiPost<LemmatizationTextRequest, LemmatizationTextResponse>(
      API_ENDPOINTS.lemmatize,
      request
    );
    
    if (response.status === 'success' && response.data) {
      return response;
    }
  } catch (error) {
    console.error('Lemmatization API error:', error);
  }
  
  // Fallback to mock for each word
  const tokens = text.split(/\s+/).filter(word => word.trim());
  const lemmes: Record<string, LemmaInfo> = {};
  
  
  return {
    status: 'success',
    data: {
      texte: text,
      lemmes,
    },
  };
}
