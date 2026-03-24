import { API_ENDPOINTS } from '@/lib/api-config';
import { apiPost } from '@/lib/api-client';
import type {
  ChatbotRequest,
  ChatbotResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Send a message to the chatbot and get a response
 */
export async function sendChatMessage(
  message: string,
  context?: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ApiResponse<ChatbotResponse>> {
  const request: ChatbotRequest = { message, context, history };
  const instant: ApiResponse<ChatbotResponse> = {
    status: 'success',
    data: mockChatbotResponse(message, context),
  };

  const response = await Promise.race([
    apiPost<ChatbotRequest, ChatbotResponse>(
      API_ENDPOINTS.chatbot,
      request
    ),
    new Promise<ApiResponse<ChatbotResponse>>((resolve) =>
      setTimeout(() => resolve(instant), 200)
    ),
  ]);

  if (response.status === 'success' && response.data) return response;
  return instant;
}

/**
 * Mock chatbot responses for development/demo purposes
 * This simulates the API response when the backend is not available
 */
export function mockChatbotResponse(
  message: string,
  context?: string
): ChatbotResponse {
  const lowerMessage = message.toLowerCase();

  // Grammar and language help responses
  const responses: Array<{ keywords: string[]; response: string; suggestions?: string[] }> = [
    {
      keywords: ['synonyme', 'synonym', 'mitovy'],
      response: 'Ny synonyma dia teny mitovy dikany. Ohatra:\n- "tsara" sy "mahafinaritra" (good, pleasant)\n- "lehibe" sy "goavana" (big, large)\n- "mandeha" sy "mamindra" (to go, to move)',
      suggestions: ['Inona no synonyma hafa?', 'Ahoana ny fampiasana azy?'],
    },
    {
      keywords: ['conjugaison', 'conjugate', 'fampiasana matoanteny'],
      response: 'Ny fampiasana matoanteny amin\'ny teny Malagasy:\n\n**Ankehitriny (Present):**\n- m- + root: manoratra (writes)\n\n**Lasa (Past):**\n- n- + root: nanoratra (wrote)\n\n**Ho avy (Future):**\n- h- + root: hanoratra (will write)',
      suggestions: ['Ohatra hafa', 'Matoanteny manokana'],
    },
    {
      keywords: ['grammar', 'grammaire', 'fitsipi-pitenenana'],
      response: 'Ny fitsipi-pitenenana Malagasy:\n\n1. **VSO word order**: Matoanteny - Subject - Object\n   Ohatra: "Manoratra taratasy Rakoto" (Rakoto writes a letter)\n\n2. **No articles**: Tsy misy "ny" sy "ilay" ho an\'ny noun tsy fantatra\n\n3. **Verb prefixes**: m-, n-, h- for tense',
      suggestions: ['Ohatra fanampiny', 'Fitsipi-pitenenana hafa'],
    },
    {
      keywords: ['translate', 'traduire', 'dikanteny', 'translation'],
      response: 'Afaka manampy anao amin\'ny dikanteny aho. Sokafy ny teny tianao hadika, dia tsindrio ny "Translate" button ao amin\'ny toolbar.\n\nSupported: Malagasy ↔ French',
      suggestions: ['Dikanteny Malagasy-Frantsay', 'Dikanteny Frantsay-Malagasy'],
    },
    {
      keywords: ['help', 'aide', 'fanampiana', 'ahoana'],
      response: 'Salama! Afaka manampy anao amin\'ireto aho:\n\n1. **Spelling** - Fanamarinana tsipelina\n2. **Grammar** - Fitsipi-pitenenana\n3. **Vocabulary** - Teny sy synonyma\n4. **Translation** - Dikanteny Malagasy-Frantsay\n5. **Conjugation** - Fampiasana matoanteny\n\nInona no fanontanianao?',
      suggestions: ['Spelling help', 'Grammar rules', 'Translation'],
    },
    {
      keywords: ['spell', 'tsipelina', 'spelling', 'orthographe'],
      response: 'Ny fanamarinana tsipelina:\n\n1. Safidio ny teny tianao hojerena\n2. Tsindrio ny "Spell Check" ao amin\'ny AI menu\n3. Hiseho ny soso-kevitra raha misy diso\n\nTips:\n- Ny "tr" sy "dr" dia mahazatra amin\'ny teny Malagasy\n- Tandremo ny "mb", "mp", "nd", "ng", "nk", "nt"',
      suggestions: ['Common mistakes', 'Phonotactic rules'],
    },
  ];

  // Find matching response
  for (const { keywords, response, suggestions } of responses) {
    if (keywords.some((kw) => lowerMessage.includes(kw))) {
      return { message: response, suggestions };
    }
  }

  // Context-aware responses
  if (context && context.length > 0) {
    const wordCount = context.split(/\s+/).length;
    return {
      message: `Hitako fa manoratra lahatsoratra misy teny ${wordCount} ianao. Inona no fanampiana ilainao momba ity lahatsoratra ity?\n\nAfaka manampy amin\'ny:\n- Fanamarinana tsipelina\n- Fanatsarana fitenenana\n- Dikanteny`,
      suggestions: ['Check spelling', 'Improve style', 'Translate selection'],
    };
  }

  // Default response
  return {
    message: 'Salama! Mpanoratra Malagasy AI assistant aho. Afaka manampy anao amin\'ny:\n\n- Fitsipi-pitenenana sy grammaire\n- Tsipelina sy spelling\n- Dikanteny Malagasy-Frantsay\n- Synonyma sy vocabulaire\n\nInona no fanontanianao?',
    suggestions: ['Help with grammar', 'Translate text', 'Check spelling'],
  };
}
