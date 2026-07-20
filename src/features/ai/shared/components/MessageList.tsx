import { useEffect, useRef, type ReactNode } from 'react';
import type { ChatMessage } from '../types/ai.types';
import { MarkdownMessage } from './MarkdownMessage';
import { StructuredResponse } from './StructuredResponse';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  starterContent?: ReactNode;
  onAction: (message: string) => Promise<void>;
  assistantLabel?: string;
}

function formatMessageTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function MessageList({
  messages,
  isLoading,
  emptyTitle,
  emptyDescription,
  starterContent,
  onAction,
  assistantLabel = 'Asistente Utamedic',
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  return (
    <section
      className="message-list"
      aria-label="Conversación"
      aria-live="polite"
    >
      {messages.length === 0 && !isLoading ? (
        <div className="empty-state">
          <div className="empty-state__illustration" aria-hidden="true">
            <span>+</span>
          </div>
          <h2>{emptyTitle}</h2>
          <p>{emptyDescription}</p>
        </div>
      ) : (
        <div className="message-list__content">
          {messages.map((message, index) => (
            <div key={message.id}>
              <article
                className={`message message--${message.role}`}
                aria-label={
                  message.role === 'assistant'
                    ? `Mensaje de ${assistantLabel}`
                    : 'Tu mensaje'
                }
              >
                <div className="message__meta">
                  <span className="message__author">
                    {message.role === 'assistant' ? assistantLabel : 'Tú'}
                  </span>
                  <time dateTime={message.createdAt}>
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                {message.role === 'assistant' ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <p className="message__text">{message.content}</p>
                )}
                {message.role === 'assistant' && (
                  <StructuredResponse message={message} onAction={onAction} />
                )}
              </article>
              {index === 0 && starterContent}
            </div>
          ))}

          {isLoading && (
            <div className="typing-indicator" role="status">
              <span className="sr-only">El asistente está respondiendo</span>
              <i />
              <i />
              <i />
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}
    </section>
  );
}
