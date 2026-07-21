import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
  own?: boolean;
}

interface Props {
  socket: Socket;
  roomId: string;
  myName: string;
}

export default function InCallChat({ socket, roomId, myName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat-message', handler);
    return () => {
      socket.off('chat-message', handler);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function sendMessage() {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      sender: myName,
      text: input,
      timestamp: new Date().toISOString(),
    };
    socket.emit('chat-message', { roomId, sender: myName, text: input });
    setMessages((prev) => [...prev, { ...msg, own: true }]);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') sendMessage();
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className={`in-call-chat ${open ? 'open' : 'closed'}`}>
      <button className="chat-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="chat-toggle__icon" aria-hidden="true">•••</span>
        <span><strong>Chat de la consulta</strong><small>{messages.length ? `${messages.length} mensaje${messages.length === 1 ? '' : 's'}` : 'Disponible durante la llamada'}</small></span>
        <i aria-hidden="true">{open ? '−' : '+'}</i>
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-panel__notice">No compartas contraseñas ni datos bancarios.</div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty"><span aria-hidden="true">•••</span><strong>Inicia la conversación</strong><p>Envía información breve relacionada con la consulta.</p></div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.own ? 'own' : 'other'}`}>
                <span className="chat-sender">{msg.own ? 'Tú' : msg.sender}<small>{formatTime(msg.timestamp)}</small></span>
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              aria-label="Mensaje para el chat de la consulta"
            />
            <button type="button" onClick={sendMessage} disabled={!input.trim()}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}
