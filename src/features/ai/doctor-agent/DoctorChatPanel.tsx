import type { ChatMessage } from '../shared/types/ai.types';
import { MessageComposer } from '../shared/components/MessageComposer';
import { MessageList } from '../shared/components/MessageList';

interface DoctorChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isOnline: boolean;
  onSend: (message: string) => Promise<void>;
  onCancel: () => void;
}

export function DoctorChatPanel({
  messages,
  isLoading,
  isOnline,
  onSend,
  onCancel,
}: DoctorChatPanelProps) {
  return (
    <section className="doctor-chat" aria-labelledby="doctor-chat-title">
      <div className="doctor-section-heading">
        <div>
          <p className="section-heading__eyebrow">Conversación contextual</p>
          <h2 id="doctor-chat-title">Chat con el copiloto</h2>
        </div>
      </div>
      <div className="doctor-chat__messages">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          emptyTitle="Copiloto listo"
          emptyDescription="Selecciona una acción o escribe una consulta."
          onAction={onSend}
          assistantLabel="Copiloto Utamedic"
        />
      </div>
      <div className="doctor-chat__composer">
        <MessageComposer
          isLoading={isLoading}
          isDisabled={!isOnline}
          onSend={onSend}
          onCancel={onCancel}
          placeholder="Pregunta sobre el paciente seleccionado"
          minLength={5}
          maxLength={1_000}
        />
      </div>
    </section>
  );
}
