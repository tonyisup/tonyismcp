import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';

interface ConversationContainerProps {
  messages: Message[];
  children?: React.ReactNode; // For the active input widget
}

export function ConversationContainer({ messages, children }: ConversationContainerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, children]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex gap-3 max-w-[90%] md:max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
            msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
          )}
        >
          {/* Avatar */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium border",
            msg.sender === 'user' ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
          )}>
            {msg.sender === 'user' ? "ME" : "AI"}
          </div>

          {/* Bubble */}
          <div className={cn(
            "p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
            msg.sender === 'user'
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted/50 text-foreground border border-border rounded-tl-none"
          )}>
            {msg.content}
          </div>
        </div>
      ))}

      {/* Active Input Area - Rendered as part of the flow */}
      {children && (
        <div className="flex gap-3 max-w-[90%] md:max-w-[80%] ml-auto flex-row-reverse animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium border bg-primary text-primary-foreground border-primary">
             ME
           </div>
           <div className="w-full">
             {children}
           </div>
        </div>
      )}

      <div className="h-4" /> {/* Spacer */}
    </div>
  );
}
