import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  SentimentCheckRequest,
  SentimentCheckResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Analyze sentiment for a phrase.
 */
export async function checkSentiment(
  text: string
): Promise<ApiResponse<SentimentCheckResponse>> {
  const request: SentimentCheckRequest = { text };
  return apiPost<SentimentCheckRequest, SentimentCheckResponse>(
    API_ENDPOINTS.sentimentCheck,
    request
  );
}
