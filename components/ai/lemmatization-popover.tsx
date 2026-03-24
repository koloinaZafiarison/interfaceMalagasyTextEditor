'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { lemmatize, mockLemmatize } from '@/services/lemmatization';
import { useEditorStore } from '@/hooks/use-editor-store';
import type { LemmatizationResponse } from '@/types/api';
import { BookOpen, X, ArrowRight } from 'lucide-react';

interface LemmatizationPopoverProps {
  children?: React.ReactNode;
}

export function LemmatizationPopover({ children }: LemmatizationPopoverProps) {
  const { selectedText, aiLoading, setAiLoading } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<LemmatizationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aiLoading.lemmatization && selectedText) {
      setOpen(true);
      handleLemmatize();
      setAiLoading('lemmatization', false);
    }
  }, [aiLoading.lemmatization, selectedText, setAiLoading]);

  const handleLemmatize = async () => {
    if (!selectedText) return;

    // Get the first word if multiple words selected
    const word = selectedText.trim().split(/\s+/)[0];
    
    setLoading(true);
    try {
      const response = await lemmatize(word);
      
      if (response.status === 'success' && response.data) {
        setResult(response.data);
      } else {
        // Fallback to mock
        setResult(mockLemmatize(word));
      }
    } catch (error) {
      // Use mock on error
      setResult(mockLemmatize(word));
    } finally {
      setLoading(false);
    }
  };

  const getPartOfSpeechLabel = (pos?: string) => {
    const labels: Record<string, string> = {
      verbe: 'Matoanteny (Verb)',
      nom: 'Anarana (Noun)',
      adj: 'Mpanondro (Adjective)',
      adv: 'Tambinteny (Adverb)',
      unknown: 'Tsy fantatra',
    };
    return labels[pos || 'unknown'] || pos;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1">
            <BookOpen className="h-4 w-4" />
            Lemmatize
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Fandrasan-teny (Lemmatization)</h4>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg">
                <span className="text-muted-foreground">{result.original}</span>
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">{result.lemma}</span>
              </div>
              
              {result.partOfSpeech && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                    {getPartOfSpeechLabel(result.partOfSpeech)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>The lemma is the base or dictionary form of a word.</p>
                <p className="mt-1 italic">
                  Ny fandrasan-teny dia ny fototra na endrika fototra amin&apos;ny teny.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a word to see its lemma (root form).
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
