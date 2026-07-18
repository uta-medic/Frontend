/*import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SIGNALING_URL = 'https://prewar-crate-demise.ngrok-free.dev'; // tu URL actual

// Genera o toma el roomId de la URL (?room=xxxx). Si no existe, crea uno nuevo.
function getRoomId(): string {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('room');
  if (fromUrl) return fromUrl;

  const generated = crypto.randomUUID();
  const newUrl = `${window.location.pathname}?room=${generated}`;
  window.history.replaceState({}, '', newUrl);
  return generated;
}

type ConnectionQuality = 'good' | 'medium' | 'poor' | 'unknown';

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const roomIdRef = useRef<string>(getRoomId());
  const statsIntervalRef = useRef<number | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [quality, setQuality] = useState<ConnectionQuality>('unknown');
  const [connectionState, setConnectionState] = useState<string>('idle');

  useEffect(() => {
  if (!consentGiven) return;

  let active = true; // bandera para descartar resultados de una ejecución vieja
  const roomId = roomIdRef.current;

  const socket = io(SIGNALING_URL, {
    extraHeaders: { 'ngrok-skip-browser-warning': 'true' },
  });
  socketRef.current = socket;

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

  /*pc.onconnectionstatechange = () => {
    if (!active) return;
    console.log('[DEBUG] connectionState cambió a:', pc.connectionState);
    setConnectionState(pc.connectionState);
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      console.log('[DEBUG] Intentando restartIce()');
      pc.restartIce();
    }
  }; ---------prueba de debugs------------

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      if (!active) {
        // esta ejecución ya fue descartada: apaga la cámara/mic que acabas de pedir
        stream.getTracks().forEach((track) => track.stop());
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

  socket.on('user-joined', async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { roomId, offer });
  });

  socket.on('offer', async ({ offer }) => {
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', { roomId, answer });
  });

  socket.on('answer', async ({ answer }) => {
    await pc.setRemoteDescription(answer);
  });

  socket.on('ice-candidate', async ({ candidate }) => {
    await pc.addIceCandidate(candidate);
  });

  socket.on('call-ended', () => {
    if (active) endCallLocally();
  });

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
    active = false; // marca esta ejecución como obsoleta
    cleanup();
  };
}, [consentGiven]);

  function cleanup() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
    if (statsIntervalRef.current) window.clearInterval(statsIntervalRef.current);
  }

  function endCallLocally() {
    cleanup();
    setCallEnded(true);
  }

  function toggleMic() {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  }

  function toggleCam() {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  }

  function endCall() {
    socketRef.current?.emit('end-call', { roomId: roomIdRef.current });
    endCallLocally();
  }

  // Pantalla de consentimiento (se muestra ANTES de pedir permisos de cámara)
  if (!consentGiven) {
    return (
      <div className="consent-screen">
        <h2>Antes de iniciar la consulta</h2>
        <p>
          Esta videollamada usa tu cámara y micrófono únicamente para la
          consulta médica. La conexión es directa entre paciente y doctor.
        </p>
        <label>
          <input type="checkbox" id="consent-checkbox" />
          {' '}Acepto iniciar la videoconsulta
        </label>
        <button
          onClick={() => {
            const checkbox = document.getElementById('consent-checkbox') as HTMLInputElement;
            if (checkbox?.checked) setConsentGiven(true);
            else alert('Debes aceptar para continuar');
          }}
        >
          Continuar
        </button>
      </div>
    );
  }

  if (callEnded) {
    return <div className="call-ended">La llamada ha finalizado.</div>;
  }

  const qualityLabel = {
    good: '🟢 Buena conexión',
    medium: '🟡 Conexión regular',
    poor: '🔴 Conexión débil',
    unknown: '⚪ Midiendo conexión...',
  }[quality];

  return (
    <div className="video-call">
      <div className="call-status">
        <span>{qualityLabel}</span>
        <span> · Estado: {connectionState}</span>
      </div>

      <div className="video-grid">
        <video ref={localVideoRef} autoPlay muted playsInline width={300} />
        <video ref={remoteVideoRef} autoPlay playsInline width={300} />
      </div>

      <div className="call-controls">
        <button onClick={toggleMic}>{micOn ? '🎤 Mutear' : '🔇 Desmutear'}</button>
        <button onClick={toggleCam}>{camOn ? '📷 Apagar cámara' : '🚫 Encender cámara'}</button>
        <button onClick={endCall} className="end-call-btn">📞 Colgar</button>
      </div>
    </div>
  );
}*/

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import InCallChat from './InCallChat';

const SIGNALING_URL = 'https://prewar-crate-demise.ngrok-free.dev'; //'https://prewar-crate-demise.ngrok-free.dev'

function getRoomId(): string {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('room');
  if (fromUrl) return fromUrl;
  const generated = crypto.randomUUID();
  window.history.replaceState({}, '', `${window.location.pathname}?room=${generated}`);
  return generated;
}

type Phase = 'form' | 'waiting' | 'doctor-idle' | 'in-call' | 'ended';
type ConnectionQuality = 'good' | 'medium' | 'poor' | 'unknown';

export default function VideoCall() {
  const roomIdRef = useRef<string>(getRoomId());
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const statsIntervalRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('form');
  const [role, setRole] = useState<'doctor' | 'paciente'>('paciente');
  const [name, setName] = useState('');
  const [ci, setCi] = useState('');
  const [consent, setConsent] = useState(false);
  const [waitingPatient, setWaitingPatient] = useState<{ name: string; ci: string } | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [quality, setQuality] = useState<ConnectionQuality>('unknown');
  const [connectionState, setConnectionState] = useState<string>('idle');

  // Socket persistente durante todo el ciclo de vida (form -> espera -> llamada)
  useEffect(() => {
    const socket = io(SIGNALING_URL, {
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' },
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

    return () => {
      socket.disconnect();
    };
  }, []);

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

  function submitForm() {
    if (!name.trim() || !ci.trim()) {
      alert('Nombre y CI son obligatorios');
      return;
    }
    if (!consent) {
      alert('Debes aceptar para continuar');
      return;
    }
    socketRef.current?.emit('register-role', { roomId: roomIdRef.current, role, name, ci });
    setPhase(role === 'doctor' ? 'doctor-idle' : 'waiting');
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

  // ---- Pantallas ----

  if (phase === 'form') {
    return (
      <div className="precall-form">
        <h2>Antes de la consulta</h2>
        <label>
          Soy: {' '}
          <select value={role} onChange={(e) => setRole(e.target.value as 'doctor' | 'paciente')}>
            <option value="paciente">Paciente</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>
        <input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="CI" value={ci} onChange={(e) => setCi(e.target.value)} />
        <label>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          {' '}Acepto iniciar la videoconsulta
        </label>
        <button onClick={submitForm}>Continuar</button>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="waiting-room">
        <h2>Sala de espera</h2>
        <p>Esperando a que el doctor te admita a la consulta...</p>
      </div>
    );
  }

  if (phase === 'doctor-idle') {
    return (
      <div className="doctor-dashboard">
        <h2>Panel del doctor</h2>
        {waitingPatient ? (
          <div className="patient-card">
            <p><strong>{waitingPatient.name}</strong> (CI: {waitingPatient.ci}) está esperando</p>
            <button onClick={admitPatient}>Admitir a la consulta</button>
          </div>
        ) : (
          <p>Aún no hay pacientes esperando...</p>
        )}
      </div>
    );
  }

  if (phase === 'ended') {
    return <div className="call-ended">La llamada ha finalizado.</div>;
  }

  // phase === 'in-call'
  const qualityLabel = {
    good: '🟢 Buena conexión',
    medium: '🟡 Conexión regular',
    poor: '🔴 Conexión débil',
    unknown: '⚪ Midiendo conexión...',
  }[quality];

  return (
    <div className="video-call">
      <div className="call-status">
        <span>{qualityLabel}</span> · <span>Estado: {connectionState}</span>
      </div>
      <div className="video-grid">
        <video ref={localVideoRef} autoPlay muted playsInline width={300} />
        <video ref={remoteVideoRef} autoPlay playsInline width={300} />
      </div>
      <div className="call-controls">
        <button onClick={toggleMic}>{micOn ? '🎤 Mutear' : '🔇 Desmutear'}</button>
        <button onClick={toggleCam}>{camOn ? '📷 Apagar cámara' : '🚫 Encender cámara'}</button>
        <button onClick={endCall} className="end-call-btn">📞 Colgar</button>
      </div>

      <InCallChat socket={socketRef.current!} roomId={roomIdRef.current} myName={name} />
    </div>
  );
}