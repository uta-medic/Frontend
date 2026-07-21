import type { AiAgent } from '../types/ai.types';
import type { QuickActionItem } from './QuickActions';
import { useAiChat } from '../hooks/useAiChat';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { LocationControls } from '../../user-agent/LocationControls';
import { ErrorState } from './ErrorState';
import { MessageComposer } from './MessageComposer';
import { MessageList } from './MessageList';
import { QuickActions } from './QuickActions';
import { SafetyNotice } from './SafetyNotice';
import { UtamedicHeader } from './UtamedicHeader';

interface AiChatLayoutProps {
  agent: AiAgent;
  eyebrow: string;
  title: string;
  description: string;
  safetyNotice: string;
  safetyEmphasis?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  placeholder: string;
  welcomeMessage?: string;
  quickActions?: QuickActionItem[];
  enableLocation?: boolean;
}

export function AiChatLayout({
  agent,
  eyebrow,
  title,
  description,
  safetyNotice,
  safetyEmphasis,
  emptyTitle,
  emptyDescription,
  placeholder,
  welcomeMessage,
  quickActions,
  enableLocation = false,
}: AiChatLayoutProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    retryLastMessage,
    startNewConversation,
  } = useAiChat(agent, welcomeMessage);
  const isOnline = useNetworkStatus();
  const isAgentUnavailable = error?.code === 'unavailable';
  const connectionLabel = !isOnline
    ? 'Sin conexión'
    : isAgentUnavailable
      ? 'No disponible'
      : 'En línea';

  const starterContent =
    quickActions || enableLocation ? (
      <div className="conversation-starter">
        {quickActions && (
          <QuickActions
            actions={quickActions}
            disabled={isLoading || !isOnline}
            onSelect={sendMessage}
          />
        )}
        {enableLocation && (
          <LocationControls
            disabled={isLoading || !isOnline}
            onSend={sendMessage}
          />
        )}
      </div>
    ) : undefined;

  return (
    <div className="app-shell">
      <UtamedicHeader />
      <main className="chat-page">
        <section className="chat-panel" aria-labelledby={`${agent}-chat-title`}>
          <div className="chat-panel__heading">
            <div className="chat-panel__identity">
              <p className="eyebrow">{eyebrow}</p>
              <h1 id={`${agent}-chat-title`}>{title}</h1>
              <p>{description}</p>
              <span className="orientation-label">Orientación general</span>
            </div>
            <div className="chat-panel__header-actions">
              <span
                className={`availability-badge ${
                  isOnline && !isAgentUnavailable
                    ? ''
                    : 'availability-badge--offline'
                }`}
                role="status"
              >
                <i aria-hidden="true" /> {connectionLabel}
              </span>
              <button
                type="button"
                className="new-conversation-button"
                onClick={() => void startNewConversation()}
              >
                <span aria-hidden="true">+</span>
                Nueva conversación
              </button>
            </div>
          </div>

          <SafetyNotice emphasis={safetyEmphasis}>{safetyNotice}</SafetyNotice>

          {!isOnline && (
            <div className="connectivity-state" role="alert">
              <strong>Estás sin conexión</strong>
              <span>Recupera tu conexión para enviar una consulta.</span>
            </div>
          )}

          {error && (
            <ErrorState error={error} onRetry={retryLastMessage} />
          )}

          <MessageList
            messages={messages}
            isLoading={isLoading}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            starterContent={starterContent}
            onAction={sendMessage}
          />

          <div className="chat-panel__footer">
            <MessageComposer
              isLoading={isLoading}
              isDisabled={!isOnline}
              onSend={sendMessage}
              onCancel={cancelRequest}
              placeholder={placeholder}
            />
            <p>
              No compartas contraseñas. En una emergencia, busca atención
              inmediata en tu localidad.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
