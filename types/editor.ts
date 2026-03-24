// Editor-related types for Malagasy Text Editor

export interface EditorState {
  content: string;
  wordCount: number;
  characterCount: number;
  lastSaved: Date | null;
  isSaving: boolean;
  isDirty: boolean;
}

export interface SaveStatus {
  status: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export interface TextSelection {
  text: string;
  from: number;
  to: number;
}

export interface FormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  heading: 0 | 1 | 2 | 3;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

export interface GhostTextState {
  visible: boolean;
  text: string;
  position: number;
}

export interface PhonotacticMark {
  from: number;
  to: number;
  pattern: string;
  message: string;
}

export type AIFeature = 
  | 'spellcheck'
  | 'lemmatization'
  | 'autocomplete'
  | 'translation'
  | 'phonotactic'
  | 'tts'
  | 'chatbot';

export interface AIFeatureState {
  loading: boolean;
  error?: string;
  lastUsed?: Date;
}

export interface EditorSettings {
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
  spellCheckEnabled: boolean;
  phonotacticCheckEnabled: boolean;
  autocompleteEnabled: boolean;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  autoSaveEnabled: true,
  autoSaveInterval: 30000, // 30 seconds
  spellCheckEnabled: true,
  phonotacticCheckEnabled: true,
  autocompleteEnabled: true,
};
