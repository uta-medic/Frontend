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

  return (
    <div className={`in-call-chat ${open ? 'open' : 'closed'}`}>
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        💬 Chat {open ? '▼' : '▲'}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="chat-empty">Aún no hay mensajes</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.own ? 'own' : 'other'}`}>
                <span className="chat-sender">{msg.own ? 'Tú' : msg.sender}</span>
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
            />
            <button onClick={sendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}