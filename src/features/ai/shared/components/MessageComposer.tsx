import {
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

interface MessageComposerProps {
  isLoading: boolean;
  isDisabled?: boolean;
  onSend: (message: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
}

export function MessageComposer({
  isLoading,
  isDisabled = false,
  onSend,
  onCancel,
  placeholder = 'Escribe tu consulta aquí…',
}: MessageComposerProps) {
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || isLoading || isDisabled) return;

    const pendingMessage = message;
    setMessage('');
    await onSend(pendingMessage);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="chat-message">
        Escribe tu mensaje
      </label>
      <textarea
        id="chat-message"
        rows={2}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        aria-describedby="composer-help"
        maxLength={2_000}
      />
      <div className="message-composer__actions">
        {isLoading && (
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || isDisabled || !message.trim()}
          aria-label="Enviar mensaje"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m4 4 17 8-17 8 3-8-3-8Zm3.8 6.7h7.6L7 6.8l.8 3.9Zm0 2.6L7 17.2l8.4-3.9H7.8Z" />
          </svg>
          <span>{isLoading ? 'Enviando' : 'Enviar'}</span>
        </button>
      </div>
      <span className="sr-only" id="composer-help">
        Presiona Enter para enviar o Shift más Enter para una nueva línea.
      </span>
    </form>
  );
}
