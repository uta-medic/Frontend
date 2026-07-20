import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3000';
const WHATSAPP_NUMBER = '59177249737'; // reemplaza por el número real, sin + ni espacios

type WidgetState = 'closed' | 'menu' | 'chat-form' | 'chat-active';

interface SupportMessage {
  sender: string;
  text: string;
  own?: boolean;
}

export default function ContactWidget() {
  const [state, setState] = useState<WidgetState>('closed');
  const [name, setName] = useState('');
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string>(crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function openWhatsApp() {
    const text = encodeURIComponent('Hola, quisiera más información sobre Uta-Medic.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  }

  function goToVideoCall() {
    window.location.href = `/consulta?room=${crypto.randomUUID()}`;
  }

  function startChat() {
    if (!name.trim() || !ci.trim() || !phone.trim()) {
      alert('Nombre, CI y teléfono son obligatorios');
      return;
    }
    const socket = io(SIGNALING_URL, {
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' },
    });
    socketRef.current = socket;

    socket.emit('register-contact', { roomId: roomIdRef.current, name, ci, phone });

    socket.on('support-message', (msg: SupportMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    setState('chat-active');
  }

  function sendMessage() {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('support-message', { roomId: roomIdRef.current, sender: name, text: input });
    setMessages((prev) => [...prev, { sender: name, text: input, own: true }]);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') sendMessage();
  }

  function closeWidget() {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setMessages([]);
    setState('closed');
  }

  if (state === 'closed') {
    return (
      <button className="contact-fab" onClick={() => setState('menu')}>
        💬 Comunícate con nosotros
      </button>
    );
  }

  return (
    <div className="contact-widget">
      <div className="widget-header">
        <h4>Uta-Medic</h4>
        <button onClick={closeWidget}>✕</button>
      </div>

      <div className="widget-body">
        {state === 'menu' && (
          <div className="widget-menu">
            <button className="menu-option" onClick={goToVideoCall}>
              <span className="menu-icon">🎥</span>
              <span>Iniciar videoconsulta</span>
            </button>
            <button className="menu-option" onClick={() => setState('chat-form')}>
              <span className="menu-icon">💬</span>
              <span>Chat con nosotros</span>
            </button>
            <button className="menu-option" onClick={openWhatsApp}>
              <span className="menu-icon dot-online">🟢</span>
              <span>WhatsApp directo</span>
            </button>
          </div>
        )}

        {state === 'chat-form' && (
          <div className="widget-form">
            <input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="CI" value={ci} onChange={(e) => setCi(e.target.value)} />
            <input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="widget-submit" onClick={startChat}>Iniciar chat</button>
          </div>
        )}

        {state === 'chat-active' && (
          <div className="widget-chat">
            <div className="widget-chat-messages">
              {messages.length === 0 && <p className="widget-chat-empty">Escríbenos, te responderemos pronto.</p>}
              {messages.map((msg, i) => (
                <div key={i} className={`widget-bubble ${msg.own ? 'own' : 'other'}`}>
                  <span className="widget-bubble-sender">{msg.own ? 'Tú' : msg.sender}</span>
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="widget-chat-input">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escribe un mensaje..." />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}