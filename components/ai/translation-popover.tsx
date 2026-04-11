'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { translate,  } from '@/services/translation';
import { useEditorStore } from '@/hooks/use-editor-store';
import type { TranslationResponse } from '@/types/api';
import { X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';
import { Database, Search, Languages, Globe } from "lucide-react";

interface TranslationPopoverProps {
  children?: React.ReactNode;
}

export function TranslationPopover({ children }: TranslationPopoverProps) {
  const { selectedText, aiLoading, setAiLoading } = useEditorStore();
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { isTranslationOpen, setTranslationOpen } = useEditorStore();

  useEffect(() => {
    if (aiLoading.translation && selectedText && !loading) {
      setTranslationOpen(true);
      handleTranslate();
    }
  }, [aiLoading.translation, selectedText]);

  const handleTranslate = async () => {
    if (!selectedText) return;

    setLoading(true);

    try {
      const response = await translate(selectedText);

      if (response.status === 'success' && response.data) {
        setResult(response.data);
      }
    } catch (e) {
      toast.error('Erreur de traduction');
    } finally {
      setLoading(false);
      setAiLoading('translation', false);
    }
  };


  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;

    await navigator.clipboard.writeText(text);

    setCopiedField(field);
    toast.success('Texte copié dans le presse papier');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Popover open={isTranslationOpen} onOpenChange={setTranslationOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1">
            <Languages className="h-4 w-4" />
            Translate
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}  
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Dikanteny (Traduction mot à mot)</h4>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTranslationOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-full w-full">
              <Spinner />
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground flex flex-col gap-1">
                <div className="flex items-center gap-1 text-primary">
                  <Database className="h-4 w-4" />
                  <span>Source</span>
                </div>

                <span className="font-medium text-black">
                  {result?.source}
                </span>
              </div>

              <div className="text-sm text-muted-foreground flex flex-col gap-1">
                <div className="flex items-center gap-1 text-primary">
                  <Search className="h-4 w-4 " />
                  <span>Mot analysé</span>
                </div>

                <span className="font-medium text-black">
                  {result?.input}
                </span>
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-primary mb-1">
                      Français :
                    </p>
                    <p className="text-sm font-medium">{result.fr}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(result.fr, 'fr')}
                    className="shrink-0"
                  >
                    {copiedField =='fr' ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-primary mb-1">
                      Malagasy :
                    </p>
                    <p className="text-sm font-medium">{result.mg}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(result.mg, 'mg')}
                    className="shrink-0"
                  >
                    {copiedField === 'mg' ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-primary mb-1">
                      Anglais :
                    </p>
                    <p className="text-sm font-medium">{result.en}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(result.en, 'en')}
                    className="shrink-0"
                  >
                    {copiedField === 'en' ? (
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
              Selectionner un texte à traduire sur l'editeur, puis cliquer sur le bouton Ai, et choisissez "Translate(Dikan-teny)"
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
