import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SIGNALING_URL = 'https://prewar-crate-demise.ngrok-free.dev'; // misma URL que usas en VideoCall
const WHATSAPP_NUMBER = '59171234567'; // reemplaza por el número real, sin + ni espacios

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
    // Redirige al flujo de videoconsulta ya existente (ajusta la ruta según tu router)
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
      <div className="contact-header">
        <span>Uta-Medic</span>
        <button onClick={closeWidget}>✕</button>
      </div>

      {state === 'menu' && (
        <div className="contact-menu">
          <button onClick={goToVideoCall}>🎥 Iniciar videoconsulta</button>
          <button onClick={() => setState('chat-form')}>💬 Chat con nosotros</button>
          <button onClick={openWhatsApp}>🟢 WhatsApp directo</button>
        </div>
      )}

      {state === 'chat-form' && (
        <div className="contact-form">
          <input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="CI" value={ci} onChange={(e) => setCi(e.target.value)} />
          <input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button onClick={startChat}>Iniciar chat</button>
        </div>
      )}

      {state === 'chat-active' && (
        <div className="contact-chat">
          <div className="chat-messages">
            {messages.length === 0 && <p className="chat-empty">Escríbenos, te responderemos pronto.</p>}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.own ? 'own' : 'other'}`}>
                <span className="chat-sender">{msg.own ? 'Tú' : msg.sender}</span>
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escribe un mensaje..." />
            <button onClick={sendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}