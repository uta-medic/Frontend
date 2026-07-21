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
    window.location.href = `/teleconsulta?room=${crypto.randomUUID()}`;
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
      <button className="contact-fab" type="button" onClick={() => setState('menu')}>
        <span aria-hidden="true">?</span>
        <span><strong>¿Necesitas ayuda?</strong><small>Estamos en línea</small></span>
      </button>
    );
  }

  return (
    <div className="contact-widget">
      <div className="widget-header">
        <div><span aria-hidden="true">+</span><div><h4>Soporte Utamedic</h4><small><i /> En línea</small></div></div>
        <button type="button" onClick={closeWidget} aria-label="Cerrar ayuda">×</button>
      </div>

      <div className="widget-body">
        {state === 'menu' && (
          <div className="widget-menu">
            <button className="menu-option" onClick={goToVideoCall}>
              <span className="menu-icon" aria-hidden="true">V</span>
              <span><strong>Iniciar videoconsulta</strong><small>Accede a tu sala virtual</small></span>
              <i aria-hidden="true">→</i>
            </button>
            <button className="menu-option" onClick={() => setState('chat-form')}>
              <span className="menu-icon" aria-hidden="true">C</span>
              <span><strong>Chat con soporte</strong><small>Escríbenos directamente</small></span>
              <i aria-hidden="true">→</i>
            </button>
            <button className="menu-option" onClick={openWhatsApp}>
              <span className="menu-icon dot-online" aria-hidden="true">W</span>
              <span><strong>WhatsApp directo</strong><small>Continuar en WhatsApp</small></span>
              <i aria-hidden="true">→</i>
            </button>
          </div>
        )}

        {state === 'chat-form' && (
          <div className="widget-form">
            <div><span className="telemedicine-kicker">Antes de comenzar</span><h4>Cuéntanos quién eres</h4><p>Usaremos estos datos para atender tu solicitud.</p></div>
            <label>Nombre completo<input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Documento de identidad<input placeholder="Número de CI" value={ci} onChange={(e) => setCi(e.target.value)} /></label>
            <label>Teléfono<input placeholder="Número de contacto" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <button className="widget-submit" onClick={startChat}>Iniciar chat</button>
          </div>
        )}

        {state === 'chat-active' && (
          <div className="widget-chat">
            <div className="widget-chat-messages">
              {messages.length === 0 && <div className="widget-chat-empty"><span aria-hidden="true">•••</span><strong>¿Cómo podemos ayudarte?</strong><p>Escríbenos y responderemos pronto.</p></div>}
              {messages.map((msg, i) => (
                <div key={i} className={`widget-bubble ${msg.own ? 'own' : 'other'}`}>
                  <span className="widget-bubble-sender">{msg.own ? 'Tú' : msg.sender}</span>
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="widget-chat-input">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escribe un mensaje..." aria-label="Mensaje para soporte" />
              <button onClick={sendMessage} disabled={!input.trim()}>Enviar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
