import { API_ENDPOINTS } from '@/lib/api-config';
import type { ApiResponse, TranslationResponse } from '@/types/api';


export async function translate(
  text: string
): Promise<ApiResponse<TranslationResponse>> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.translate}?word=${encodeURIComponent(text)}`
    );

    const data = await response.json();

    return {
      status: 'success',
      data: {
        input: data.input,
        fr: data.fr,
        mg: data.mg,
        en: data.en,
        source : data.source
      },
    };
  } catch (error) {
    console.error('API error:', error);

    return {
      status: 'error',
      error: 'Erreur de traduction',
    };
  }
}