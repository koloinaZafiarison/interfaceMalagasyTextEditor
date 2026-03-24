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
  const instant: ApiResponse<PhonotacticCheckResponse> = {
    status: 'success',
    data: mockPhonotacticCheck(text),
  };

  const response = await Promise.race([
    apiPost<PhonotacticCheckRequest, PhonotacticCheckResponse>(
      API_ENDPOINTS.phonotactic,
      request
    ),
    new Promise<ApiResponse<PhonotacticCheckResponse>>((resolve) =>
      setTimeout(() => resolve(instant), 150)
    ),
  ]);

  if (response.status === 'success' && response.data) return response;
  return instant;
}

/**
 * Invalid consonant combinations in Malagasy
 * These patterns are phonotactically incorrect
 */
const INVALID_PATTERNS = [
  { pattern: /nb/gi, message: "Invalid combination 'nb' - use 'mb' instead" },
  { pattern: /mk/gi, message: "Invalid combination 'mk' - not allowed in Malagasy" },
  { pattern: /\bnk/gi, message: "Invalid word-initial 'nk' - use 'n-k' or 'ank' instead" },
  { pattern: /dt/gi, message: "Invalid combination 'dt' - not allowed in Malagasy" },
  { pattern: /bp/gi, message: "Invalid combination 'bp' - not allowed in Malagasy" },
  { pattern: /sz/gi, message: "Invalid combination 'sz' - not allowed in Malagasy" },
  { pattern: /pm/gi, message: "Invalid combination 'pm' - not allowed in Malagasy" },
  { pattern: /td/gi, message: "Invalid combination 'td' - not allowed in Malagasy" },
  { pattern: /kg/gi, message: "Invalid combination 'kg' - not allowed in Malagasy" },
  { pattern: /gk/gi, message: "Invalid combination 'gk' - not allowed in Malagasy" },
] as const;

/**
 * Check text for phonotactic errors (local validation)
 * This runs client-side for immediate feedback
 */
export function checkPhonotacticsLocal(text: string): PhonotacticCheckResponse {
  const errors: PhonotacticError[] = [];

  for (const { pattern, message } of INVALID_PATTERNS) {
    let match;
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
      errors.push({
        pattern: match[0],
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
        message,
      });
    }
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
}

/**
 * Mock phonotactic check for development/demo purposes
 * This simulates the API response when the backend is not available
 */
export function mockPhonotacticCheck(text: string): PhonotacticCheckResponse {
  return checkPhonotacticsLocal(text);
}

/**
 * Get the invalid patterns for use in TipTap decorations
 */
export function getInvalidPatterns() {
  return INVALID_PATTERNS.map(({ pattern, message }) => ({
    pattern: pattern.source,
    flags: pattern.flags,
    message,
  }));
}
