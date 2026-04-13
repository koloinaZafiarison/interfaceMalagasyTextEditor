'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { checkPhonotactics } from '@/services/phonotactic';
import type { PhonotacticError } from '@/types/api';
import { X, Check, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Props {
  text: string;
  open: boolean;
  onClose: () => void;
}

export function PhonotacticPopover({ text, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PhonotacticError[]>([]);

  useEffect(() => {
    if (!open || !text) return;

    const run = async () => {
      setLoading(true);
      try {
        const res = await checkPhonotactics(text);

        if (res.status === 'success' && res.data) {
          setErrors(res.data.errors);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [open, text]);

  return (
    <Popover open={open} onOpenChange={onClose}>
      {/* trigger invisible (comme ton Dropdown AI) */}
      <PopoverTrigger asChild>
        <div className="w-0 h-0" />
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 overflow-hidden rounded border bg-white shadow-xl"
        align="start"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Phonotactique
          </div>

          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* CONTENT */}
        <div className="p-3 space-y-3 max-h-72 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : errors.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Aucun problème détecté
            </div>
          ) : (
            errors.map((err, i) => (
              <div
                key={i}
                className="p-2 rounded-md border bg-red-50/40 space-y-1"
              >
                <div className="text-sm font-semibold">
                  Mot à checker : <span className=' text-red-600'>{err.mot}</span>
                </div>
                <div className="text-muted-foreground">
                  {err.description}
                </div>
                {err.regle && (
                  <div className='text-xs'>
                    Règle non respecté : <span className='text-danger'>{err.regle}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}