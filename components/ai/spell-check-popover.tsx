{/*'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { checkSpelling } from '@/services/spell-check';
import { useEditorStore } from '@/hooks/use-editor-store';
import type { SpellCheckUIItem } from '@/types/api';
import { SpellCheck, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SpellCheckPopoverProps {
  onReplace?: (original: string, replacement: string) => void;
  children?: React.ReactNode;
}

function transformCorrections(data: any): SpellCheckUIItem[] {
  return Object.entries(data.corrections).map(
    ([word, suggestions]: any) => ({
      original: word,
      suggestions: suggestions.map(([w]: any) => w),
    })
  );
}

export function SpellCheckPopover({
  onReplace,
  children,
}: SpellCheckPopoverProps) {
  const { selectedText, aiLoading, setAiLoading } = useEditorStore();

  const [open, setOpen] = useState(false);
  const [corrections, setCorrections] = useState<SpellCheckUIItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aiLoading.spellcheck && selectedText) {
      setOpen(true);
      handleSpellCheck();
      setAiLoading('spellcheck', false);
    }
  }, [aiLoading.spellcheck, selectedText, setAiLoading]);

  const handleSpellCheck = async () => {
    if (!selectedText) {
      toast.error('Please select text to check spelling');
      return;
    }

    setLoading(true);

    try {
      const response = await checkSpelling(selectedText);

      if (response.status === 'success' && response.data) {
        const transformed = transformCorrections(response.data);

        setCorrections(transformed);

        if (transformed.length === 0) {
          toast.success('No spelling errors found!');
        }
      } else {
        setCorrections([]);
        toast.error('Spell check failed');
      }
    } catch (error) {
      console.error(error);
      setCorrections([]);
      toast.error('Error during spell check');
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = (original: string, replacement: string) => {
    console.log("ETOOOO ")
    onReplace?.(original, replacement);
    toast.success(`Replaced "${original}" with "${replacement}"`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1">
            <SpellCheck className="h-4 w-4" />
            Spell Check
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Spell Check</h4>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : corrections.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No spelling errors found</span>
            </div>
          ) : (
            <div className="space-y-3">
              {corrections.map((correction, index) => (
                <div key={index} className="space-y-1.5">
                  <p className="text-sm font-medium text-destructive">
                    {correction.original}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {correction.suggestions.map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          handleReplace(correction.original, suggestion)
                        }
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedText && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Checking: &ldquo;{selectedText.slice(0, 50)}
                {selectedText.length > 50 ? '...' : ''}&rdquo;
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}*/}