'use client';

import { Editor } from '@tiptap/react';
import { useEditorStore } from '@/hooks/use-editor-store';
import { getAutocompleteSuggestions } from '@/services/autocomplete';
import { textToSpeech, speakWithWebSpeech } from '@/services/tts';
import { toast } from 'sonner';
import { checkSpelling } from '@/services/spell-check';

export function useAiEditor(editor: Editor) {
  const {
    selectedText,
    setAiLoading,
    aiLoading,
    setTranslationOpen,
  } = useEditorStore();

  // SPELL CHECK
  /*const spellCheck = async (replaceFn?: (text: string, corrected: string) => void) => {
    if (!selectedText) {
        toast.error("Sélectionne un texte");
        return;
    }

    setAiLoading('spellcheck', true);

    try {
        const response = await checkSpelling(selectedText);

        if (response.status !== 'success' || !response.data) {
        toast.error("Erreur spellcheck");
        return;
        }

        const corrections = response.data.corrections;

        const firstWord = Object.keys(corrections)[0];
        const suggestion = corrections[firstWord]?.[0]?.[0];

        if (replaceFn && firstWord && suggestion) {
            replaceFn(firstWord, suggestion);
            toast.success("Correction appliquée");
        }

    } finally {
        setAiLoading('spellcheck', false);
    }
    };*/
  const spellCheck = async (replaceFn?: (o: string, r: string) => void) => {
    if (!selectedText) {
        toast.error("Sélectionne un texte");
        return;
    }

    setAiLoading('spellcheck', true);

    try {
        const response = await checkSpelling(selectedText);

        if (!response.data) return;

        const corrections = response.data.corrections;

        const firstWord = Object.keys(corrections)[0];
        const suggestion = corrections[firstWord]?.[0]?.[0];

        if (replaceFn && firstWord && suggestion) {
        replaceFn(firstWord, suggestion);
        }

    } finally {
        setAiLoading('spellcheck', false);
    }
    };
  
  
    // TRANSLATION
  const translate = async () => {
    if (!selectedText) {
      toast.error("Sélectionne un texte");
      return;
    }

    const words = selectedText.trim().split(/\s+/);

    if (words.length > 1) {
      toast.error("Sélectionne un seul mot");
      return;
    }

    setAiLoading('translation', true);
    setTranslationOpen(true);
  };

  // AUTOCOMPLETE
  const autocomplete = async () => {
    const { from, to } = editor.state.selection;

    if (from !== to) return;

    const text = editor.getText();

    setAiLoading('autocomplete', true);

    try {
      const response = await getAutocompleteSuggestions(text, 3);

      if (response.status !== 'success' || !response.data) {
        toast.error("Erreur autocomplete");
        return;
      }

      const result = response.data;
      const suggestion = result.suggestions[0];

      if (!suggestion) {
        toast.info('Aucune suggestion');
        return;
      }

      const completion = suggestion.startsWith(result.prefix)
        ? suggestion.slice(result.prefix.length)
        : suggestion;

      editor.chain().focus().insertContent(completion + ' ').run();

      toast.success('Suggestion appliquée');

    } catch {
      toast.error("Erreur réseau");
    } finally {
      setAiLoading('autocomplete', false);
    }
  };

  // TTS
  const readAloud = async () => {
    const text = selectedText?.trim() ? selectedText : editor.getText();

    if (!text.trim()) {
      toast.error("Aucun texte");
      return;
    }

    setAiLoading('tts', true);

    try {
      const res = await textToSpeech(text);

      if (res.status === 'success' && res.data?.audio) {
        const url = URL.createObjectURL(res.data.audio);
        const audio = new Audio(url);

        audio.onended = () => URL.revokeObjectURL(url);

        await audio.play();
        return;
      }

      speakWithWebSpeech(text);

    } catch {
      toast.error("Erreur TTS");
    } finally {
      setAiLoading('tts', false);
    }
  };

  // LEMMATIZATION (placeholder)
  const lemmatize = async () => {
    if (!selectedText) {
      toast.error("Sélectionne un texte");
      return;
    }

    setAiLoading('lemmatization', true);
  };

  return {
    spellCheck,
    translate,
    autocomplete,
    readAloud,
    lemmatize,
    aiLoading,
  };
}