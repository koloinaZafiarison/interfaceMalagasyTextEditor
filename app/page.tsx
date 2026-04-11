'use client';

import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { ChatbotSheet } from '@/components/chatbot/chatbot-sheet';
import { LemmatizationPopover } from '@/components/ai/lemmatization-popover';
import { TranslationPopover } from '@/components/ai/translation-popover';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/hooks/use-editor-store';
import { FileText, Settings, Download, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function EditorPage() {
  const { content, setContent, markSaved, settings, updateSettings } = useEditorStore();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkTheme = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        setContent(text);
        markSaved();
        toast.success('Document imported successfully');
      }
    };
    input.click();
  };

  const handleNewDocument = () => {
    if (content && content !== '<p></p>') {
      const confirmed = window.confirm(
        'Are you sure you want to create a new document? Unsaved changes will be lost.'
      );
      if (!confirmed) return;
    }
    setContent('');
    markSaved();
    toast.success('New document created');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight">Mpanoratra Malagasy</h1>
              <p className="text-[10px] text-muted-foreground">AI-Powered Text Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                  aria-label={
                    mounted
                      ? isDarkTheme
                        ? 'Activer le mode clair'
                        : 'Activer le mode sombre'
                      : 'Basculer le theme'
                  }
                >
                  <span className="text-base leading-none">
                    {mounted ? (isDarkTheme ? '☀️' : '🌙') : '🌙'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {mounted
                  ? isDarkTheme
                    ? 'Passer en mode clair'
                    : 'Passer en mode sombre'
                  : 'Changer le theme'}
              </TooltipContent>
            </Tooltip>

            {/* File Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      File
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">File options</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNewDocument}>
                  <FileText className="mr-2 h-4 w-4" />
                  New Document
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export HTML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Settings</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => updateSettings({ autoSaveEnabled: !settings.autoSaveEnabled })}
                >
                  <span className="flex-1">Auto-save</span>
                  <span className={settings.autoSaveEnabled ? 'text-primary' : 'text-muted-foreground'}>
                    {settings.autoSaveEnabled ? 'On' : 'Off'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSettings({ spellCheckEnabled: !settings.spellCheckEnabled })}
                >
                  <span className="flex-1">Spell Check</span>
                  <span className={settings.spellCheckEnabled ? 'text-primary' : 'text-muted-foreground'}>
                    {settings.spellCheckEnabled ? 'On' : 'Off'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSettings({ autocompleteEnabled: !settings.autocompleteEnabled })}
                >
                  <span className="flex-1">Autocomplete</span>
                  <span className={settings.autocompleteEnabled ? 'text-primary' : 'text-muted-foreground'}>
                    {settings.autocompleteEnabled ? 'On' : 'Off'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <TiptapEditor />
        </div>
      </main>

      {/* Hidden AI Feature Popovers (triggered via store) */}
      <div className="hidden">
        {/*<SpellCheckPopover />*/}
        <LemmatizationPopover />
        <TranslationPopover />
      </div>
      
      {/* Chatbot Sheet */}
      <ChatbotSheet />
    </div>
  );
}
