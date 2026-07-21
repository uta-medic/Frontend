import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import InCallChat from './InCallChat';
import { useAuth } from './auth/AuthContext';

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3000';

function getRoomId(): string {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('room');
  if (fromUrl) return fromUrl;
  const generated = crypto.randomUUID();
  window.history.replaceState({}, '', `${window.location.pathname}?room=${generated}`);
  return generated;
}

type Phase = 'confirm' | 'waiting' | 'doctor-idle' | 'in-call' | 'ended';
type ConnectionQuality = 'good' | 'medium' | 'poor' | 'unknown';

export default function VideoCall() {
  const { user, token, logout } = useAuth();
  const roomIdRef = useRef<string>(getRoomId());
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const statsIntervalRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('confirm');
  const [consent, setConsent] = useState(false);
  const [waitingPatient, setWaitingPatient] = useState<{ name: string; ci: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<'copied' | 'shared' | 'error' | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [quality, setQuality] = useState<ConnectionQuality>('unknown');
  const [connectionState, setConnectionState] = useState<string>('idle');

  // Socket persistente durante todo el ciclo de vida (confirm -> espera -> llamada)
  useEffect(() => {
    const socket = io(SIGNALING_URL, {
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' },
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('patient-waiting', (data: { name: string; ci: string }) => {
      setWaitingPatient(data);
    });

    socket.on('call-admitted', () => {
      setPhase('in-call');
    });

    socket.on('call-ended', () => {
      cleanupMedia();
      setPhase('ended');
    });

    socket.on('auth-error', (err: { message: string }) => {
      setAuthError(err.message);
      // La sesión ya no es válida (token vencido/inválido): cerramos sesión.
      logout();
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Setup de WebRTC: solo se activa cuando entramos a phase === 'in-call'
  useEffect(() => {
    if (phase !== 'in-call') return;
    let active = true;
    const roomId = roomIdRef.current;
    const socket = socketRef.current!;

    const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      if (!active) return;
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!active) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      socket.emit('join-room', roomId);
    });

    pc.ontrack = (event) => {
      if (!active) return;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit('ice-candidate', { roomId, candidate: event.candidate });
    };

    const onUserJoined = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { roomId, offer });
    };
    const onOffer = async ({ offer }: any) => {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer });
    };
    const onAnswer = async ({ answer }: any) => {
      await pc.setRemoteDescription(answer);
    };
    const onIceCandidate = async ({ candidate }: any) => {
      await pc.addIceCandidate(candidate);
    };

    socket.on('user-joined', onUserJoined);
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice-candidate', onIceCandidate);

    statsIntervalRef.current = window.setInterval(async () => {
      if (!active || !pcRef.current) return;
      const stats = await pcRef.current.getStats();
      let rtt: number | null = null;
      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.currentRoundTripTime != null) {
          rtt = report.currentRoundTripTime * 1000;
        }
      });
      if (rtt === null) setQuality('unknown');
      else if (rtt < 150) setQuality('good');
      else if (rtt < 400) setQuality('medium');
      else setQuality('poor');
    }, 3000);

    return () => {
      active = false;
      socket.off('user-joined', onUserJoined);
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      cleanupMedia();
    };
  }, [phase]);

  function cleanupMedia() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    if (statsIntervalRef.current) window.clearInterval(statsIntervalRef.current);
  }

  function submitConfirm() {
    if (!consent) {
      alert('Debes aceptar para continuar');
      return;
    }
    console.log('📤 Enviando register-role', { roomId: roomIdRef.current, role: user?.role });
    socketRef.current?.emit('register-role', { roomId: roomIdRef.current });
    setPhase(user?.role === 'doctor' ? 'doctor-idle' : 'waiting');
  }

  function admitPatient() {
    socketRef.current?.emit('admit-patient', { roomId: roomIdRef.current });
    setPhase('in-call'); // el doctor entra directo también
  }

  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  }
  function toggleCam() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  }
  function endCall() {
    socketRef.current?.emit('end-call', { roomId: roomIdRef.current });
    cleanupMedia();
    setPhase('ended');
  }

  function getConsultationUrl() {
    const url = new URL('/teleconsulta', window.location.origin);
    url.searchParams.set('room', roomIdRef.current);
    return url.toString();
  }

  function fallbackCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand('copy');
    textArea.remove();
    if (!copied) throw new Error('No se pudo copiar el enlace');
  }

  async function copyConsultationUrl() {
    try {
      const url = getConsultationUrl();
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else fallbackCopy(url);
      setShareFeedback('copied');
    } catch {
      setShareFeedback('error');
    }
  }

  async function shareConsultationUrl() {
    const url = getConsultationUrl();

    if (!navigator.share) {
      await copyConsultationUrl();
      return;
    }

    try {
      await navigator.share({
        title: 'Invitación a teleconsulta Utamedic',
        text: 'Ingresa a la sala virtual de tu teleconsulta mediante este enlace:',
        url,
      });
      setShareFeedback('shared');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareFeedback('error');
    }
  }

  // ---- Pantallas ----

  if (!user) {
    // Salvaguarda: VideoCall solo debería montarse con sesión activa (ver App.tsx)
    return null;
  }

  if (phase === 'confirm') {
    return (
      <section className="precall-form consultation-card precall-check">
        <div className="precall-check__heading">
          <span className="precall-check__icon" aria-hidden="true">✓</span>
          <div>
            <span className="telemedicine-kicker">Comprobación previa</span>
            <h2>Antes de entrar a la consulta</h2>
            <p>Verifica tu identidad y confirma que estás listo para acceder a la sala.</p>
          </div>
        </div>

        {authError && <p className="error-text" role="alert">{authError}</p>}

        <div className="precall-identity">
          <span className="precall-identity__avatar" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span>
          <div><small>Ingresarás como</small><strong>{user.name}</strong><span>{user.role === 'doctor' ? 'Médico' : 'Paciente'} · CI {user.ci}</span></div>
          <span className="precall-identity__verified">Identidad verificada</span>
        </div>

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span><strong>Acepto iniciar la videoconsulta</strong><small>Confirmo que estoy en un lugar adecuado y autorizo el uso de cámara y micrófono.</small></span>
        </label>

        <button className="telemedicine-submit" type="button" onClick={submitConfirm}>Continuar a la sala <span aria-hidden="true">→</span></button>
        <p className="precall-check__privacy">Tu audio y video se utilizan únicamente durante esta consulta.</p>
      </section>
    );
  }

  if (phase === 'waiting') {
    return (
      <section className="waiting-room consultation-card" aria-live="polite">
        <div className="waiting-room__animation"><span /><span /><i>+</i></div>
        <span className="telemedicine-kicker">Sala de espera</span>
        <h2>El profesional te atenderá pronto</h2>
        <p>Permanece en esta pantalla. Entrarás automáticamente cuando el médico admita la consulta.</p>
        <div className="waiting-room__status"><i /> Conectado y esperando admisión</div>
        <small>Puedes comprobar tu cámara y micrófono cuando comience la llamada.</small>
      </section>
    );
  }

  if (phase === 'doctor-idle') {
    return (
      <section className="doctor-dashboard consultation-card">
        <header className="doctor-dashboard__header">
          <div><span className="telemedicine-kicker">Panel médico</span><h2>Pacientes en espera</h2><p>Admite al paciente cuando estés preparado para iniciar.</p></div>
          <span className="consultation-availability"><i /> Disponible</span>
        </header>

        <div className="doctor-invitation">
          <div className="doctor-invitation__heading">
            <span className="doctor-invitation__icon" aria-hidden="true">↗</span>
            <div><strong>Invitar paciente a esta sala</strong><p>Copia o comparte este enlace. Funcionará con el dominio actual de la aplicación.</p></div>
          </div>
          <div className="doctor-invitation__link">
            <input type="text" readOnly value={getConsultationUrl()} aria-label="Enlace de invitación a la teleconsulta" />
            <button type="button" className="doctor-invitation__copy" onClick={copyConsultationUrl}>
              {shareFeedback === 'copied' ? 'Copiado' : 'Copiar enlace'}
            </button>
            <button type="button" className="doctor-invitation__share" onClick={shareConsultationUrl}>
              Compartir
            </button>
          </div>
          <p className={`doctor-invitation__feedback ${shareFeedback === 'error' ? 'is-error' : ''}`} role="status" aria-live="polite">
            {shareFeedback === 'copied' && 'Enlace copiado al portapapeles.'}
            {shareFeedback === 'shared' && 'Invitación compartida correctamente.'}
            {shareFeedback === 'error' && 'No se pudo copiar o compartir. Selecciona el enlace manualmente.'}
          </p>
        </div>

        {waitingPatient ? (
          <div className="patient-card">
            <span className="patient-card__avatar" aria-hidden="true">{waitingPatient.name.trim().charAt(0).toUpperCase()}</span>
            <div><small>Paciente en sala</small><strong>{waitingPatient.name}</strong><span>CI {waitingPatient.ci}</span></div>
            <span className="patient-card__waiting"><i /> Esperando</span>
            <button className="telemedicine-submit" type="button" onClick={admitPatient}>Admitir a consulta</button>
          </div>
        ) : (
          <div className="doctor-dashboard__empty"><span aria-hidden="true">+</span><strong>Aún no hay pacientes esperando</strong><p>Esta lista se actualizará automáticamente.</p></div>
        )}
      </section>
    );
  }

  if (phase === 'ended') {
    return <section className="call-ended consultation-card"><span aria-hidden="true">✓</span><h2>La consulta ha finalizado</h2><p>La conexión de audio y video se cerró correctamente.</p><a href="/" className="telemedicine-button telemedicine-button--secondary">Volver al inicio</a></section>;
  }

  // phase === 'in-call'
  const qualityLabel = {
    good: 'Buena conexión',
    medium: 'Conexión regular',
    poor: 'Conexión débil',
    unknown: 'Midiendo conexión',
  }[quality];

  return (
    <div className="video-call">
      <header className="call-status">
        <div><span className="call-status__live"><i /> En consulta</span><strong>Teleconsulta Utamedic</strong></div>
        <div><span className={`call-quality call-quality--${quality}`}><i /> {qualityLabel}</span><small>Estado: {connectionState}</small></div>
      </header>
      <div className="video-stage">
        <div className="remote-video">
          <video ref={remoteVideoRef} autoPlay playsInline />
          <div className="video-placeholder"><span>+</span><strong>Esperando video del participante</strong></div>
          <span className="video-participant-label">Participante remoto</span>
        </div>
        <div className="local-video">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <span className="video-participant-label">Tú</span>
          {!camOn && <div className="camera-off-placeholder"><span>{user.name.trim().charAt(0).toUpperCase()}</span></div>}
        </div>
      </div>
      <div className="call-controls">
        <button type="button" className={!micOn ? 'is-disabled' : undefined} onClick={toggleMic} aria-pressed={!micOn}><span aria-hidden="true">{micOn ? 'M' : '×'}</span>{micOn ? 'Silenciar' : 'Activar audio'}</button>
        <button type="button" className={!camOn ? 'is-disabled' : undefined} onClick={toggleCam} aria-pressed={!camOn}><span aria-hidden="true">{camOn ? 'C' : '×'}</span>{camOn ? 'Apagar cámara' : 'Activar cámara'}</button>
        <button type="button" onClick={endCall} className="end-call-btn"><span aria-hidden="true">×</span>Finalizar</button>
      </div>

      <InCallChat socket={socketRef.current!} roomId={roomIdRef.current} myName={user.name} />
    </div>
  );
}
