'use client';

import { type Editor } from '@tiptap/react';
import { useEditorStore } from '@/hooks/use-editor-store';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface EditorStatusBarProps {
  editor: Editor;
  className?: string;
}

export function EditorStatusBar({ editor, className }: EditorStatusBarProps) {
  const { wordCount, characterCount, saveStatus, settings, ghostText, sentiment } = useEditorStore();

  const formatLastSaved = (date: Date | undefined) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSaveStatusDisplay = () => {
    switch (saveStatus.status) {
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-primary">
            <Check className="h-3 w-3" />
            <span className="hidden sm:inline">Saved</span>
            {saveStatus.lastSaved && (
              <span className="text-muted-foreground text-[10px]">
                ({formatLastSaved(saveStatus.lastSaved)})
              </span>
            )}
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="hidden sm:inline">Saving...</span>
          </span>
        );
      case 'unsaved':
        return (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Unsaved changes</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Save failed</span>
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 mt-2 text-xs text-muted-foreground bg-card border border-border rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <span>
          <strong className="font-medium text-foreground">{wordCount}</strong>{' '}
          {wordCount === 1 ? 'word' : 'words'}
        </span>
        <span>
          <strong className="font-medium text-foreground">{characterCount}</strong>{' '}
          {characterCount === 1 ? 'character' : 'characters'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {settings.autocompleteEnabled && ghostText.visible && (
          <span className="hidden md:inline text-[20px] text-muted-foreground/80">
            Suggestion: {ghostText.text}
          </span>
        )}
        {sentiment && (
          <span className="hidden md:inline font-bold text-[20px] text-muted-foreground/80">
            Sentiment: {sentiment}
          </span>
        )}
        {settings.autoSaveEnabled && (
          <span className="hidden sm:inline text-[18px] text-muted-foreground/70">
            Auto-save: {settings.autoSaveInterval / 1000}s
          </span>
        )}
        {getSaveStatusDisplay()}
      </div>
    </div>
  );
}
