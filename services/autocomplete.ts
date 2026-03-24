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
  topK = 3
): Promise<ApiResponse<AutocompleteResponse>> {
  const request: AutocompleteRequest = { text, top_k: topK };
  const response = await apiPost<AutocompleteRequest, unknown>(
    API_ENDPOINTS.autocomplete,
    request
  );

  if (response.status !== 'success' || !response.data) {
    return { status: 'error', error: response.error ?? 'Autocomplete request failed' };
  }

  const normalized = normalizeAutocompleteResponse(response.data, text);
  return { status: 'success', data: normalized };
}

function getLastToken(text: string): string {
  const trimmed = text.replace(/\s+$/, '');
  const tokens = trimmed.split(/\s+/);
  return tokens[tokens.length - 1] ?? '';
}

function normalizeAutocompleteResponse(
  raw: unknown,
  sourceText: string
): AutocompleteResponse {
  const prefix = getLastToken(sourceText);

  // Expected shape can be:
  // { suggestions: string[] } or { suggestions: [{ word, prob }] }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'suggestions' in raw &&
    Array.isArray((raw as { suggestions?: unknown }).suggestions)
  ) {
    const suggestionsRaw = (raw as { suggestions: unknown[] }).suggestions ?? [];
    const suggestions = suggestionsRaw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (
          typeof item === 'object' &&
          item !== null &&
          'word' in item &&
          typeof (item as { word?: unknown }).word === 'string'
        ) {
          return (item as { word: string }).word;
        }
        return null;
      })
      .filter((item): item is string => Boolean(item))
      .slice(0, 3);
    return { suggestions, prefix };
  }

  // Alternate shape: string[]
  if (Array.isArray(raw)) {
    const suggestions = raw
      .filter((item): item is string => typeof item === 'string')
      .slice(0, 3);
    return { suggestions, prefix };
  }

  // Alternate shape: { words: string[] } or { predictions: string[] }
  if (typeof raw === 'object' && raw !== null) {
    const candidate =
      (raw as { words?: unknown }).words ??
      (raw as { predictions?: unknown }).predictions;
    if (Array.isArray(candidate)) {
      const suggestions = candidate
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 3);
      return { suggestions, prefix };
    }
  }

  return { suggestions: [], prefix };
}
