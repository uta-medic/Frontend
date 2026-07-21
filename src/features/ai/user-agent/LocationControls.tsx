import { useState, type FormEvent } from 'react';
import type { SendMessageContext } from '../shared/types/ai.types';

interface LocationControlsProps {
  disabled: boolean;
  onSend: (message: string, context?: SendMessageContext) => Promise<void>;
}

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export function LocationControls({ disabled, onSend }: LocationControlsProps) {
  const [zone, setZone] = useState('');
  const [status, setStatus] = useState<LocationStatus>('idle');

  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('granted');
        void onSend('Buscar centros cerca de mi ubicación autorizada.', {
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'browser-permission',
          },
        });
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 300_000 },
    );
  }

  function submitZone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedZone = zone.trim();
    if (!normalizedZone) return;

    void onSend(`Buscar centros médicos en la zona ${normalizedZone}.`, {
      manualZone: normalizedZone,
    });
    setZone('');
  }

  return (
    <section className="location-controls" aria-labelledby="location-title">
      <div>
        <p className="section-heading__eyebrow">Ubicación opcional</p>
        <h2 id="location-title">Busca por una zona</h2>
        <p>No solicitaremos tu ubicación sin que presiones el botón.</p>
      </div>

      <div className="location-controls__actions">
        <button
          type="button"
          className="location-button"
          onClick={requestLocation}
          disabled={disabled || status === 'requesting'}
        >
          {status === 'requesting' ? 'Solicitando permiso…' : 'Usar mi ubicación'}
        </button>

        <span className="location-divider">o</span>

        <form onSubmit={submitZone}>
          <label className="sr-only" htmlFor="manual-zone">
            Escribe una zona
          </label>
          <input
            id="manual-zone"
            value={zone}
            onChange={(event) => setZone(event.target.value)}
            placeholder="Ej.: Zona Sur"
            disabled={disabled}
            maxLength={80}
          />
          <button type="submit" disabled={disabled || !zone.trim()}>
            Buscar
          </button>
        </form>
      </div>

      <div className="location-feedback" aria-live="polite">
        {status === 'granted' && 'Permiso concedido para esta búsqueda.'}
        {status === 'denied' &&
          'No se concedió el permiso. Puedes escribir una zona manualmente.'}
        {status === 'unsupported' &&
          'La ubicación no está disponible. Puedes escribir una zona.'}
      </div>
    </section>
  );
}
