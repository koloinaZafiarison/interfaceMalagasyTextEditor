'use client';

import { type Editor } from '@tiptap/react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  ChevronDown,
  Sparkles,
  MessageCircle,
  Volume2,
  Loader2,
  Languages,
  BookOpen,
  SpellCheck,
} from 'lucide-react';
import { useEditorStore } from '@/hooks/use-editor-store';
import { cn } from '@/lib/utils';
//import { translate, mockTranslate } from '@/services/translation';
import { getAutocompleteSuggestions } from '@/services/autocomplete';
import { textToSpeech, speakWithWebSpeech } from '@/services/tts';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor;
  className?: string;
  onSpellCheckRequest?: () => void;
}

interface ToolbarButtonProps {
  editor: Editor;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={onClick}
          disabled={disabled}
          className={cn(
            'h-8 w-8 p-0',
            isActive && 'bg-primary/10 text-primary'
          )}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={5}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({ editor, className, onSpellCheckRequest, }: EditorToolbarProps) {
  const { setChatOpen, selectedText, setAiLoading, aiLoading, settings, setTranslationOpen } = useEditorStore();

  const applyTranslation = async () => {
    if (!selectedText) {
      toast.error("Sélectionne un texte");
      return;
    }

    // check plusieurs mots
    const words = selectedText.trim().split(/\s+/);

    if (words.length > 1) {
      toast.error("Sélectionne un seul mot uniquement");
      return;
    }

    setAiLoading('translation', true);
    setTranslationOpen(true);
  };

  const applyAutocomplete = async () => {
    const { from, to } = editor.state.selection;
    if (from !== to) return;
    const text = editor.getText();
    setAiLoading('autocomplete', true);
    try {
      const response = await getAutocompleteSuggestions(text, 3);
      if (response.status !== 'success' || !response.data) {
        toast.error("Erreur API d'autocomplétion");
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
      const completionWithTrailingSpace = /\s$/.test(completion)
        ? completion
        : `${completion} `;
      editor.chain().focus().insertContent(completionWithTrailingSpace).run();
      toast.success(`Suggestion appliquée: ${suggestion}`);
    } catch {
      toast.error("Erreur réseau d'autocomplétion");
    } finally {
      setAiLoading('autocomplete', false);
    }
  };

  const readAloud = async () => {
    const text = selectedText?.trim() ? selectedText : editor.getText();
    if (!text.trim()) {
      toast.error('Aucun texte a lire');
      return;
    }

    setAiLoading('tts', true);
    try {
      const apiResponse = await textToSpeech(text);
      if (apiResponse.status === 'success' && apiResponse.data?.audio) {
        const audioUrl = URL.createObjectURL(apiResponse.data.audio);
        const audio = new Audio(audioUrl);
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          toast.error('Lecture audio echouee');
        };
        await audio.play();
        toast.success(selectedText ? 'Lecture de la selection' : 'Lecture du document');
        return;
      }

      const utterance = speakWithWebSpeech(text, { rate: 0.85, pitch: 1, volume: 1 });
      if (!utterance) {
        toast.error(apiResponse.error || 'Text-to-speech non disponible');
      }
    } catch {
      toast.error('Erreur lors de la lecture vocale');
    } finally {
      setAiLoading('tts', false);
    }
  };

  const alignments = [
    { value: 'left', icon: AlignLeft, label: 'Align Left' },
    { value: 'center', icon: AlignCenter, label: 'Align Center' },
    { value: 'right', icon: AlignRight, label: 'Align Right' },
    { value: 'justify', icon: AlignJustify, label: 'Justify' },
  ] as const;

  const currentAlignment = alignments.find((a) =>
    editor.isActive({ textAlign: a.value })
  ) || alignments[0];

  const CurrentAlignIcon = currentAlignment.icon;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 p-2 bg-card border border-border rounded-lg mb-2',
        className
      )}
    >
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          tooltip="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          tooltip="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          tooltip="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          tooltip="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          tooltip="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          tooltip="Block Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Alignment */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                <CurrentAlignIcon className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            Text Alignment
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          {alignments.map((alignment) => (
            <DropdownMenuItem
              key={alignment.value}
              onClick={() =>
                editor.chain().focus().setTextAlign(alignment.value).run()
              }
              className={cn(
                editor.isActive({ textAlign: alignment.value }) &&
                  'bg-primary/10 text-primary'
              )}
            >
              <alignment.icon className="mr-2 h-4 w-4" />
              {alignment.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* AI Features */}
      <div className="flex items-center gap-0.5">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">AI</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={5}>
              AI Features
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              disabled={!selectedText || aiLoading.spellcheck || !settings.spellCheckEnabled}
              onClick={() => onSpellCheckRequest?.()}
            >
              <SpellCheck className="mr-2 h-4 w-4" />
              Spell Check
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!selectedText}
              onClick={() => {
                // Trigger lemmatization
                setAiLoading('lemmatization', true);
              }}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Lemmatize (Fandrasan-teny)
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!selectedText}
              onClick={applyTranslation}
            >
              <Languages className="mr-2 h-4 w-4" />
              Translate (Dikanteny)
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={aiLoading.autocomplete || !settings.autocompleteEnabled}
              onClick={applyAutocomplete}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Autocomplete
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={aiLoading.tts}
              onClick={readAloud}
            >
              {aiLoading.tts ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-4 w-4" />
              )}
              {aiLoading.tts ? 'Lecture en cours...' : 'Read Aloud (Lire)'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            Open Chatbot Assistant
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
