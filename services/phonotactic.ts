import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  PhonotacticCheckRequest,
  PhonotacticCheckResponse,
  PhonotacticError,
  ApiResponse,
} from '@/types/api';

/**
 * Check text for phonotactic errors in Malagasy
 */

export async function checkPhonotactics(
  text: string
): Promise<ApiResponse<PhonotacticCheckResponse>> {
  const request: PhonotacticCheckRequest = { text };

  const response = await apiPost<
    PhonotacticCheckRequest,
    PhonotacticCheckResponse
  >(API_ENDPOINTS.phonotactic, request);

  if (response.status === 'success') return response;

  return {
    status: 'error',
    data: {
      texte: text,
      errors: [],
      isValid: true,
    },
  };
}