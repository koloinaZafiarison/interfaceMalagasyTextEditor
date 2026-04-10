'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  textToSpeech,
  speakWithWebSpeech,
  stopSpeech,
  isSpeaking,
} from '@/services/tts';
import { useEditorStore } from '@/hooks/use-editor-store';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
  className?: string;
}

export function TTSButton({ className }: TTSButtonProps) {
  const { selectedText, content, aiLoading, setAiLoading } = useEditorStore();
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (aiLoading.tts) {
      handleSpeak();
      setAiLoading('tts', false);
    }
  }, [aiLoading.tts, setAiLoading]);

  // Check if currently speaking
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      const webSpeaking = isSpeaking();
      const audioSpeaking = !!audioRef.current && !audioRef.current.paused;
      setSpeaking(webSpeaking || audioSpeaking);
    }, 100);

    return () => clearInterval(checkSpeaking);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const getTextToSpeak = (): string => {
    if (selectedText && selectedText.trim().length > 0) {
      return selectedText;
    }
    
    // Extract plain text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleSpeak = async () => {
    if (speaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      stopSpeech();
      setSpeaking(false);
      return;
    }

    const textToSpeak = getTextToSpeak();
    
    if (!textToSpeak || textToSpeak.trim().length === 0) {
      toast.error('No text to read. Please write or select some text.');
      return;
    }

    setLoading(true);

    const apiResponse = await textToSpeech(textToSpeak);
    if (apiResponse.status === 'success' && apiResponse.data?.audio) {
      const audioUrl = URL.createObjectURL(apiResponse.data.audio);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setSpeaking(false);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setSpeaking(false);
        toast.error('Audio playback failed');
      };

      try {
        await audio.play();
        setSpeaking(true);
        setLoading(false);
        toast.info(
          selectedText
            ? 'Reading selected text...'
            : 'Reading full document...'
        );
        return;
      } catch {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      }
    }

    // Fallback to browser speech if the API call fails.
    const utterance = speakWithWebSpeech(textToSpeak, {
      rate: 0.85,
      pitch: 1,
      volume: 1,
      onEnd: () => {
        setSpeaking(false);
        setLoading(false);
      },
      onError: (error) => {
        setSpeaking(false);
        setLoading(false);
        toast.error(`Speech error: ${error}`);
      },
    });

    if (utterance) {
      setSpeaking(true);
      setLoading(false);
      toast.info(
        selectedText
          ? 'Reading selected text...'
          : 'Reading full document...'
      );
    } else {
      setLoading(false);
      toast.error(apiResponse.error || 'Text-to-speech is not supported in your browser');
    }
  };

  const handleStop = () => {
    stopSpeech();
    setSpeaking(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={speaking ? 'default' : 'ghost'}
          size="sm"
          onClick={speaking ? handleStop : handleSpeak}
          disabled={loading}
          className={cn(
            'gap-1',
            speaking && 'bg-primary text-primary-foreground',
            className
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : speaking ? (
            <Square className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {speaking ? 'Stop' : 'Read'}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={5}>
        {speaking
          ? 'Stop reading'
          : selectedText
          ? 'Read selected text'
          : 'Read full document'}
      </TooltipContent>
    </Tooltip>
  );
}
