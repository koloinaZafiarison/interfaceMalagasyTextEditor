'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useEditorStore } from '@/hooks/use-editor-store';
import { sendChatMessage, mockChatbotResponse } from '@/services/chatbot';
import type { ChatMessage as ChatMessageType } from '@/types/api';
import { Trash2, Bot } from 'lucide-react';
import { toast } from 'sonner';

export function ChatbotSheet() {
  const {
    isChatOpen,
    setChatOpen,
    chatMessages,
    addChatMessage,
    clearChatMessages,
    content,
  } = useEditorStore();
  
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Extract plain text from HTML content for context
  const getPlainTextContent = () => {
    if (typeof window === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    addChatMessage(userMessage);

    setLoading(true);

    try {
      // Prepare history for context
      const history = chatMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Get current document context
      const context = getPlainTextContent();

      const response = await sendChatMessage(messageText, context, history);

      if (response.status === 'success' && response.data) {
        const assistantMessage: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        addChatMessage(assistantMessage);
      } else {
        // Fallback to mock
        const mockResponse = mockChatbotResponse(messageText, context);
        const assistantMessage: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: mockResponse.message,
          timestamp: new Date(),
        };
        addChatMessage(assistantMessage);
      }
    } catch (error) {
      // Use mock on error
      const context = getPlainTextContent();
      const mockResponse = mockChatbotResponse(messageText, context);
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: mockResponse.message,
        timestamp: new Date(),
      };
      addChatMessage(assistantMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearChatMessages();
    toast.success('Chat history cleared');
  };

  return (
    <Sheet open={isChatOpen} onOpenChange={setChatOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-base">Mpanoratra AI</SheetTitle>
                <SheetDescription className="text-xs">
                  Malagasy Language Assistant
                </SheetDescription>
              </div>
            </div>
            {chatMessages.length > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClearChat}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">
                Welcome to Mpanoratra AI
              </h3>
              <p className="text-xs text-muted-foreground max-w-[250px]">
                I can help you with Malagasy grammar, spelling, vocabulary,
                and translation. Ask me anything!
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['Grammar help', 'Spelling rules', 'Translation'].map(
                  (suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="py-2">
              {chatMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {loading && (
                <div className="flex gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <ChatInput
            onSend={handleSendMessage}
            disabled={loading}
            placeholder="Fanontaniana... (Ask a question...)"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
