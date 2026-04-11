import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  SpellCheckRequest,
  SpellCheckApiResponse,
  ApiResponse,
} from '@/types/api';

export async function checkSpelling(
  text: string
): Promise<ApiResponse<SpellCheckApiResponse>> {
  const request: SpellCheckRequest = { texte: text };

  try {
    const response = await apiPost<
      SpellCheckRequest,
      SpellCheckApiResponse
    >(API_ENDPOINTS.spellcheck, request);

    if (!response || response.status !== 'success' || !response.data) {
      return {
        status: 'error',
        data: {
          texte: text,
          corrections: {},
        },
      };
    }

    return response;
  } catch (error) {
    console.error('Spellcheck error:', error);

    return {
      status: 'error',
      data: {
        texte: text,
        corrections: {},
      },
    };
  }
}