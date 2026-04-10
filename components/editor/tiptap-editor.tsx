'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { useEffect, useCallback, useRef, useState } from 'react';
import { useEditorStore } from '@/hooks/use-editor-store';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { EditorToolbar } from './editor-toolbar';
import { EditorStatusBar } from './editor-status-bar';
import { cn } from '@/lib/utils';
import { getAutocompleteSuggestions } from '@/services/autocomplete';
import { checkSpelling, mockSpellCheck } from '@/services/spell-check';
import { checkSentiment } from '@/services/sentiment-check';
import { toast } from 'sonner';

interface TiptapEditorProps {
  className?: string;
}

interface SuggestionPopupState {
  open: boolean;
  type: 'autocomplete' | 'spellcheck';
  suggestions: string[];
  x: number;
  y: number;
  from: number;
  to: number;
  prefix?: string;
}

const ghostTextPluginKey = new PluginKey('ghost-text-decoration');

function sanitizeEditorHtml(html: string): string {
  // Prevent script nodes from being rendered inside editor content.
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

const GhostTextExtension = Extension.create({
  name: 'ghostTextDecoration',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: ghostTextPluginKey,
        props: {
          decorations: (state) => {
            const { ghostText, settings } = useEditorStore.getState();
            if (!settings.autocompleteEnabled || !ghostText.visible || !ghostText.text) {
              return null;
            }

            const { selection } = state;
            if (!selection.empty) {
              return null;
            }

            const widget = Decoration.widget(
              selection.from,
              () => {
                const span = document.createElement('span');
                span.className = 'ghost-text';
                span.textContent = ghostText.text;
                return span;
              },
              { side: 1 }
            );

            return DecorationSet.create(state.doc, [widget]);
          },
        },
      }),
    ];
  },
});

export function TiptapEditor({ className }: TiptapEditorProps) {
  const autocompleteRequestIdRef = useRef(0);
  const spellCheckRequestIdRef = useRef(0);
  const sentimentRequestIdRef = useRef(0);
  const lastSentimentSentenceRef = useRef('');
  const [suggestionPopup, setSuggestionPopup] = useState<SuggestionPopupState>({
    open: false,
    type: 'autocomplete',
    suggestions: [],
    x: 0,
    y: 0,
    from: 0,
    to: 0,
  });

  const { 
    content, 
    setContent, 
    updateCounts, 
    markDirty,
    markSaved,
    settings,
    setSelection,
    setGhostText,
    clearGhostText,
    setSentiment,
    clearSentiment,
  } = useEditorStore();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder: 'Manomboka manoratra eto... (Start writing here...)',
      }),
      CharacterCount,
      GhostTextExtension,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = sanitizeEditorHtml(editor.getHTML());
      setContent(html);
      markDirty();
      
      // Update counts
      const words = editor.storage.characterCount.words();
      const characters = editor.storage.characterCount.characters();
      updateCounts(words, characters);

      const text = editor.getText();
      const cursorPosition = editor.state.selection.from;

      if (settings.autocompleteEnabled) {
        const applyGhostSuggestion = (suggestionText: string, prefix: string) => {
          const ghost =
            suggestionText && suggestionText.startsWith(prefix)
              ? suggestionText.slice(prefix.length)
              : '';

          if (ghost) {
            const currentGhost = useEditorStore.getState().ghostText;
            const hasChanged =
              !currentGhost.visible ||
              currentGhost.text !== ghost ||
              currentGhost.position !== cursorPosition;
            if (hasChanged) {
              setGhostText({ visible: true, text: ghost, position: cursorPosition });
              editor.view.dispatch(editor.state.tr.setMeta('ghost-text-refresh', true));
            }
          } else if (useEditorStore.getState().ghostText.visible) {
            clearGhostText();
            editor.view.dispatch(editor.state.tr.setMeta('ghost-text-refresh', true));
          }
        };

        // API refresh (non-blocking) with stale-request protection.
        const requestId = ++autocompleteRequestIdRef.current;
        void getAutocompleteSuggestions(text, 3)
          .then((response) => {
            if (requestId !== autocompleteRequestIdRef.current) return;
            if (editor.state.selection.from !== cursorPosition) return;

            if (response.status === 'success' && response.data) {
              const result = response.data;
              applyGhostSuggestion(result.suggestions[0] || '', result.prefix);
              openAutocompletePopup(result.suggestions, result.prefix, cursorPosition);
              return;
            }

            clearGhostText();
            closeSuggestionPopup();
          })
          .catch(() => {
            clearGhostText();
            closeSuggestionPopup();
          });
      } else {
        if (useEditorStore.getState().ghostText.visible) {
          clearGhostText();
          editor.view.dispatch(editor.state.tr.setMeta('ghost-text-refresh', true));
        }
        closeSuggestionPopup();
      }

      const extractLastCompletedSentence = (value: string): string => {
        const normalized = value.replace(/\s+/g, ' ').trim();
        if (!normalized) return '';
        const matches = normalized.match(/[^.!?\n]+[.!?]/g);
        return matches?.[matches.length - 1]?.trim() ?? '';
      };

      const completedSentence = extractLastCompletedSentence(text);
      if (!completedSentence) {
        lastSentimentSentenceRef.current = '';
        clearSentiment();
      } else if (completedSentence !== lastSentimentSentenceRef.current) {
        lastSentimentSentenceRef.current = completedSentence;
        const requestId = ++sentimentRequestIdRef.current;
        void checkSentiment(completedSentence)
          .then((response) => {
            if (requestId !== sentimentRequestIdRef.current) return;
            if (response.status !== 'success' || !response.data) return;
            setSentiment(response.data.sentiment, response.data.text);
          })
          .catch(() => {
            // Keep previous sentiment on network errors.
          });
      }

    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      setSelection(text, text ? { from, to } : null);
      if (from !== to && useEditorStore.getState().ghostText.visible) {
        clearGhostText();
        editor.view.dispatch(editor.state.tr.setMeta('ghost-text-refresh', true));
        closeSuggestionPopup();
      }
    },
  });

  const closeSuggestionPopup = useCallback(() => {
    setSuggestionPopup((prev) => ({ ...prev, open: false, suggestions: [] }));
  }, []);

  const openAutocompletePopup = useCallback(
    (suggestions: string[], prefix: string, position: number) => {
      if (!editor || suggestions.length === 0) {
        closeSuggestionPopup();
        return;
      }

      const anchorPos = Math.max(1, position - prefix.length);
      const anchorCoords = editor.view.coordsAtPos(anchorPos);
      const cursorCoords = editor.view.coordsAtPos(position);
      const editorRect = editor.view.dom.getBoundingClientRect();
      setSuggestionPopup({
        open: true,
        type: 'autocomplete',
        suggestions: suggestions.slice(0, 3),
        // Convert viewport coordinates to editor-local coordinates.
        // This anchors the popup right after the typed token.
        x: cursorCoords.left - editorRect.left,
        y: anchorCoords.bottom - editorRect.top + 6,
        from: position,
        to: position,
        prefix,
      });
    },
    [editor, closeSuggestionPopup]
  );

  const handleSpellCheckRequest = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, ' ');
    if (!selected.trim()) {
      toast.error('Sélectionne un texte à corriger');
      return;
    }

    const showSuggestions = (suggestions: string[]) => {
      if (suggestions.length === 0) {
        toast.success('Aucune erreur détectée');
        closeSuggestionPopup();
        return;
      }
      const coords = editor.view.coordsAtPos(from);
      setSuggestionPopup({
        open: true,
        type: 'spellcheck',
        suggestions: suggestions.slice(0, 3),
        x: coords.left,
        y: coords.bottom + 6,
        from,
        to,
      });
    };

    const instant = mockSpellCheck(selected);
    showSuggestions(instant.corrections[0]?.suggestions ?? []);

    const requestId = ++spellCheckRequestIdRef.current;
    void checkSpelling(selected)
      .then((response) => {
        if (requestId !== spellCheckRequestIdRef.current) return;
        const result =
          response.status === 'success' && response.data
            ? response.data
            : instant;
        showSuggestions(result.corrections[0]?.suggestions ?? []);
      })
      .catch(() => {
        // Keep instant suggestions on API error.
      });
  }, [editor, closeSuggestionPopup]);

  const applySuggestion = useCallback(
    (suggestion: string) => {
      if (!editor) return;

      if (suggestionPopup.type === 'autocomplete') {
        const completion =
          suggestionPopup.prefix && suggestion.startsWith(suggestionPopup.prefix)
            ? suggestion.slice(suggestionPopup.prefix.length)
            : suggestion;
        const completionWithTrailingSpace = /\s$/.test(completion)
          ? completion
          : `${completion} `;
        editor.chain().focus().insertContent(completionWithTrailingSpace).run();
      } else {
        editor
          .chain()
          .focus()
          .insertContentAt(
            { from: suggestionPopup.from, to: suggestionPopup.to },
            suggestion
          )
          .run();
        toast.success('Correction appliquée');
      }

      closeSuggestionPopup();
    },
    [editor, suggestionPopup, closeSuggestionPopup]
  );

  // Auto-save functionality
  const autoSave = useDebouncedCallback(() => {
    if (settings.autoSaveEnabled) {
      markSaved();
    }
  }, settings.autoSaveInterval);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      autoSave();
    }
  }, [content, autoSave, editor]);

  // Restore content on mount
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(sanitizeEditorHtml(content));
    }
  }, [editor, content]);

  // Keyboard shortcuts for ghost text acceptance
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && editor) {
      if (
        suggestionPopup.open &&
        suggestionPopup.type === 'autocomplete' &&
        suggestionPopup.suggestions[0]
      ) {
        e.preventDefault();
        applySuggestion(suggestionPopup.suggestions[0]);
        return;
      }
      const ghost = useEditorStore.getState().ghostText;
      if (ghost.visible && ghost.text) {
        e.preventDefault();
        const ghostWithTrailingSpace = /\s$/.test(ghost.text)
          ? ghost.text
          : `${ghost.text} `;
        editor.chain().focus().insertContent(ghostWithTrailingSpace).run();
        clearGhostText();
      }
    }
    if (e.key === 'Escape' && suggestionPopup.open) {
      e.preventDefault();
      closeSuggestionPopup();
    }
  }, [editor, clearGhostText, suggestionPopup, applySuggestion, closeSuggestionPopup]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <EditorToolbar editor={editor} onSpellCheckRequest={handleSpellCheckRequest} />
      
      <div className="relative flex-1 overflow-auto bg-editor-bg rounded-lg border border-border shadow-sm">
        <EditorContent 
          editor={editor} 
          className="min-h-125"
        />
        {suggestionPopup.open && suggestionPopup.suggestions.length > 0 && (
          <div
            className="absolute z-30 min-w-44 rounded-md border bg-popover p-1 shadow-md"
            style={{ left: `${suggestionPopup.x}px`, top: `${suggestionPopup.y}px` }}
          >
            {suggestionPopup.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="block w-full rounded-sm px-2 py-1 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <EditorStatusBar editor={editor} />
    </div>
  );
}
