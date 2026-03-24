'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { translate, mockTranslate } from '@/services/translation';
import { useEditorStore } from '@/hooks/use-editor-store';
import type { TranslationResponse } from '@/types/api';
import { Languages, X, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TranslationPopoverProps {
  children?: React.ReactNode;
}

export function TranslationPopover({ children }: TranslationPopoverProps) {
  const { selectedText, aiLoading, setAiLoading } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<'mg-fr' | 'fr-mg'>('mg-fr');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (aiLoading.translation && selectedText) {
      setOpen(true);
      handleTranslate();
      setAiLoading('translation', false);
    }
  }, [aiLoading.translation, selectedText, setAiLoading]);

  const handleTranslate = async () => {
    if (!selectedText) return;

    setLoading(true);
    try {
      const response = await translate(selectedText, direction);
      
      if (response.status === 'success' && response.data) {
        setResult(response.data);
      } else {
        // Fallback to mock
        setResult(mockTranslate(selectedText, direction));
      }
    } catch (error) {
      // Use mock on error
      setResult(mockTranslate(selectedText, direction));
    } finally {
      setLoading(false);
    }
  };

  const toggleDirection = () => {
    const newDirection = direction === 'mg-fr' ? 'fr-mg' : 'mg-fr';
    setDirection(newDirection);
    if (selectedText) {
      setLoading(true);
      translate(selectedText, newDirection)
        .then((response) => {
          if (response.status === 'success' && response.data) {
            setResult(response.data);
          } else {
            setResult(mockTranslate(selectedText, newDirection));
          }
        })
        .catch(() => {
          setResult(mockTranslate(selectedText, newDirection));
        })
        .finally(() => setLoading(false));
    }
  };

  const copyToClipboard = async () => {
    if (result?.translated) {
      await navigator.clipboard.writeText(result.translated);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1">
            <Languages className="h-4 w-4" />
            Translate
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Dikanteny (Translation)</h4>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Direction Toggle */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className={`text-sm ${direction === 'mg-fr' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              Malagasy
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleDirection}
              className="h-7 w-7"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <span className={`text-sm ${direction === 'fr-mg' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              Frantsay
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  {direction === 'mg-fr' ? 'Malagasy' : 'Frantsay'}:
                </p>
                <p className="text-sm">{result.original}</p>
              </div>
              
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-primary mb-1">
                      {direction === 'mg-fr' ? 'Frantsay' : 'Malagasy'}:
                    </p>
                    <p className="text-sm font-medium">{result.translated}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Select text to translate between Malagasy and French.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
