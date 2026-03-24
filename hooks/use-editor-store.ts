'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  SaveStatus, 
  GhostTextState, 
  PhonotacticMark,
  EditorSettings,
} from '@/types/editor';
import type { ChatMessage } from '@/types/api';

interface EditorStore {
  // Editor content state
  content: string;
  setContent: (content: string) => void;
  
  // Word and character counts
  wordCount: number;
  characterCount: number;
  updateCounts: (wordCount: number, characterCount: number) => void;
  
  // Save status
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
  markDirty: () => void;
  markSaved: () => void;
  
  // Ghost text (autocomplete)
  ghostText: GhostTextState;
  setGhostText: (state: Partial<GhostTextState>) => void;
  clearGhostText: () => void;
  
  // Phonotactic marks
  phonotacticMarks: PhonotacticMark[];
  setPhonotacticMarks: (marks: PhonotacticMark[]) => void;
  clearPhonotacticMarks: () => void;
  
  // Chatbot state
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  
  // Settings
  settings: EditorSettings;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  
  // Selection
  selectedText: string;
  selectionRange: { from: number; to: number } | null;
  setSelection: (text: string, range: { from: number; to: number } | null) => void;
  
  // AI feature loading states
  aiLoading: Record<string, boolean>;
  setAiLoading: (feature: string, loading: boolean) => void;
}

const defaultSettings: EditorSettings = {
  autoSaveEnabled: true,
  autoSaveInterval: 30000,
  spellCheckEnabled: true,
  phonotacticCheckEnabled: true,
  autocompleteEnabled: true,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // Editor content
      content: '',
      setContent: (content) => set({ content }),
      
      // Counts
      wordCount: 0,
      characterCount: 0,
      updateCounts: (wordCount, characterCount) => 
        set({ wordCount, characterCount }),
      
      // Save status
      saveStatus: { status: 'saved' },
      setSaveStatus: (saveStatus) => set({ saveStatus }),
      markDirty: () => set({ saveStatus: { status: 'unsaved' } }),
      markSaved: () => set({ 
        saveStatus: { status: 'saved', lastSaved: new Date() } 
      }),
      
      // Ghost text
      ghostText: { visible: false, text: '', position: 0 },
      setGhostText: (state) => 
        set({ ghostText: { ...get().ghostText, ...state } }),
      clearGhostText: () => 
        set({ ghostText: { visible: false, text: '', position: 0 } }),
      
      // Phonotactic marks
      phonotacticMarks: [],
      setPhonotacticMarks: (marks) => set({ phonotacticMarks: marks }),
      clearPhonotacticMarks: () => set({ phonotacticMarks: [] }),
      
      // Chat
      chatMessages: [],
      addChatMessage: (message) => 
        set({ chatMessages: [...get().chatMessages, message] }),
      clearChatMessages: () => set({ chatMessages: [] }),
      isChatOpen: false,
      setChatOpen: (open) => set({ isChatOpen: open }),
      
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) => 
        set({ settings: { ...get().settings, ...newSettings } }),
      
      // Selection
      selectedText: '',
      selectionRange: null,
      setSelection: (text, range) => 
        set({ selectedText: text, selectionRange: range }),
      
      // AI loading
      aiLoading: {},
      setAiLoading: (feature, loading) => 
        set({ aiLoading: { ...get().aiLoading, [feature]: loading } }),
    }),
    {
      name: 'malagasy-editor-storage',
      partialize: (state) => ({
        content: state.content,
        settings: state.settings,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
